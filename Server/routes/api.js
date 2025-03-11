const express = require('express');
const router = express.Router();
const pool = require('../db');

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


module.exports = router;