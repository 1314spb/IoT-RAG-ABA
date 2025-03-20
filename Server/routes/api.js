const express = require('express');
const axios = require("axios");
const fs = require('fs');
const save_payload = require('../utils/save_payload');
const cal_sum = require('../utils/cal_sum');

const pool = require('../db');
const router = express.Router();

require('dotenv').config();

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

router.get("/task_sum", async (req, res) => {
  const { student_id } = req.query;

  console.log("student_id:", student_id);
  if (!student_id) {
    return res.status(400).json({ error: 'Missing student_id parameter' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const query = 'SELECT domain, trialresult FROM student_sessions WHERE student_id = ?';
    const rows = await conn.query(query, [student_id]);

    const Academic_and_Learning = rows.filter(row => row.domain === "Academic and Learning");
    const Social_Emotion = rows.filter(row => row.domain === "Social Emotion");
    const Communication = rows.filter(row => row.domain === "Communication");
    const Sensory_Motor_Skill = rows.filter(row => row.domain === "Sensory Motor Skill");
    const Independent_and_Self_help = rows.filter(row => row.domain === "Independent and Self-help");
    const Behavioural_Development = rows.filter(row => row.domain === "Behavioural Development");

    const sum = {
      Academic_and_Learning: { id: 1, value: cal_sum(Academic_and_Learning) },
      Social_Emotion: { id: 2, value: cal_sum(Social_Emotion) },
      Communication: { id: 3, value: cal_sum(Communication) },
      Sensory_Motor_Skill: { id: 4, value: cal_sum(Sensory_Motor_Skill) },
      Independent_and_Self_help: { id: 5, value: cal_sum(Independent_and_Self_help) },
      Behavioural_Development: { id: 6, value: cal_sum(Behavioural_Development) },
    };
    // save_payload(sum);

    return res.status(200).json(sum);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});


router.post('/generate', async (req, res) => {
  const { student_id, domain, additionalNeed } = req.body;
  console.log("student_id:", student_id, "domain:", domain, "additionalNeed:", additionalNeed);
  if (!student_id || !domain) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const pass_tasks_query = "SELECT task, subtask, trialresult FROM student_sessions WHERE student_id = ? AND domain = ? ORDER BY date DESC LIMIT 20";
    const pass_tasks = await conn.query(pass_tasks_query, [student_id, domain]);
    console.log("pass_tasks length:", pass_tasks.length);

    const generated_tasks_query = "SELECT task, subtask, description, status AS trialresult FROM student_pass_generated_task WHERE student_id = ? AND domain = ?";
    const pass_generated_task = await conn.query(generated_tasks_query, [student_id, domain]);
    console.log("pass_generated_task length:", pass_generated_task.length);

    const last_task_query = "SELECT task, subtask, timestamp, trialresult, bvp, gsr, wristtemp, acceleration_x, acceleration_y, acceleration_z, acceleration, description FROM student_sessions WHERE student_id = ? ORDER BY id DESC LIMIT 1";
    const last_task = await conn.query(last_task_query, [student_id]);
    console.log("last_task:", last_task);

    const task_sum = cal_sum(pass_tasks);

    const gen_task_sum = cal_sum(pass_generated_task);

    // const targetIP = "http://localhost:8000";
    const payload = {
      student_id,
      domain,
      additionalNeed,
      pass_tasks,
      pass_generated_task,
      last_task,
      task_sum,
      gen_task_sum,
    };

    // save_payload(payload);
    const targetIP = process.env.BASE_URL || "http://127.0.0.1:8000";

    console.log("Sending POST request /service/generate to targetIP:", targetIP);
    const response = await axios.post(`${targetIP}/service/generate`, payload);
    const modelResponse = JSON.parse(response.data.model_response);

    console.log("response:", modelResponse);

    // console.log("Response.data type:", typeof(response.data))

    return res.status(201).json(modelResponse);
  } catch (error) {
    console.error(error);
    // console.log("error:", error);
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