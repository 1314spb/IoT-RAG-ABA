module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    // 僅在開發環境顯示錯誤細節
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};