const express = require('express');
const axios = require("axios");
const fs = require('fs');

const save_payload = require('../utils/save_payload');
const cal_percent = require('../utils/cal_percent');

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

    const query = 'SELECT * FROM student_pass_generated_task WHERE student_id = ?';
    const rows = await conn.query(query, [student_id]);
    console.log("rows:", rows.length);

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
    const query = 'SELECT * FROM student_sessions WHERE student_id = ? LIMIT 5000';
    const rows = await conn.query(query, [student_id]);

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

    console.log("Calculating average percent...");
    const task_percent = cal_percent(pass_tasks);

    const gen_task_percent = cal_percent(pass_generated_task);

    // console.log("pass_tasks:", pass_tasks);
    // console.log("pass_generated_task:", pass_generated_task);

    const targetIP = "http://localhost:5000";
    const payload = {
      student_id,
      domain,
      additionalNeed,
      pass_tasks,
      pass_generated_task,
      task_percent,
      gen_task_percent,
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


router.patch("/taskOnSave/:id", async (req, res) => {
  const { id } = req.params;
  const allowedFields = ["task", "subtask", "trialresult", "description"];

  const fields = [];
  const values = [];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({ success: false, message: "No valid fields to update" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const sql = `UPDATE student_sessions SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    const result = await conn.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    return res.json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (conn) conn.release();
  }
});


module.exports = router;