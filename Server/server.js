const app = require('./app');
const pool = require('./db');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
  pool.getConnection()
    .then(async (conn) => {
      console.log("Sussessful connection to database");
      conn.release();
    })
    .catch((err) => {
      console.error("Fail connection to database:", err);
    });
});