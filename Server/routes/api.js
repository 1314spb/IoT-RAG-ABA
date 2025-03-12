const express = require('express');
const axios = require("axios");
const fs = require('fs');

const save_payload = require('../utils/save_payload');

const pool = require('../db');
const router = express.Router();

router.get('/past_gen_tasks', async (req, res) => {
  const { student_id } = req.query;

  if (!student_id) {
    return res.status(400).json({ error: 'Missing student_id parameter' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    // 使用原生 SQL 語法查詢資料表 past_generated_tasks
    const query = 'SELECT * FROM student_pass_generated_task WHERE student_id = ?';
    console.log("query:", query);
    console.log("student_id:", student_id);
    const rows = await conn.query(query, [student_id]);

    // console.log("rows:", JSON.stringify(rows, null, 2));

    // 檢查是否有資料回傳
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: `No past generated tasks found for student_id ${student_id}`
      });
    }

    // 直接回傳查詢結果（rows 已經是純 JavaScript 物件）
    return res.status(200).json(rows);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
  finally {
    if (conn) conn.release();
  }
});


router.get('/students/:student_id', async (req, res) => {
  const { student_id } = req.params;
  console.log("get_student:", student_id);
  let conn;

  try {
    conn = await pool.getConnection();
    // 使用原生 SQL 語法查詢資料表 student_sessions
    const query = 'SELECT * FROM student_sessions WHERE student_id = ?';
    const rows = await conn.query(query, [student_id]);

    // 檢查是否有資料回傳
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: `No sessions found for student_id ${student_id}`
      });
    }

    // 直接回傳查詢結果（rows 已經是純 JavaScript 物件）
    return res.status(200).json({
      student_id,
      sessions: rows
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.post('/generate', async (req, res) => {
  const { student_id, domain, additionalNeed } = req.body;
  // student_id: int
  // domain: string
  // additionalNeed: string

  if (!student_id || !domain) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const pass_tasks_query = "SELECT id, domain, task, subtask, trialresult FROM student_sessions WHERE student_id = ? AND domain = ?";
    const pass_tasks = await conn.query(pass_tasks_query, [student_id, domain]);

    const generated_tasks_query = "SELECT task_id, domain, task, subtask, description, date, status FROM student_pass_generated_task WHERE student_id = ? AND domain = ?";
    const pass_generated_task = await conn.query(generated_tasks_query, [student_id, domain]);

    // console.log("pass_tasks:", pass_tasks);
    // console.log("pass_generated_task:", pass_generated_task);

    const targetIP = "http://localhost:5000";
    const payload = {
      student_id,
      domain,
      additionalNeed,
      pass_tasks,
      pass_generated_task
    };
    
    // Save payload to a file
    save_payload(payload);

    // const response = await axios.post(`${targetIP}/service/generate`, payload);

    // console.log("response:", response.data);

    return res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;