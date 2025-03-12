if (typeof BigInt.prototype.toJSON !== 'function') {
	BigInt.prototype.toJSON = function () {
		return this.toString();
	};
}

const express = require('express');
const morgan = require('morgan');             	// HTTP 請求日誌
const fs = require('fs');
const helmet = require('helmet');             	// 安全性相關 HTTP 標頭
const compression = require('compression');   	// Gzip 壓縮回應
const cookieParser = require('cookie-parser');  // 處理 cookie
const cors = require('cors');                 	// 跨來源資源分享
const path = require('path');

const app = express();

// -------------------------
// 設定各項 middleware
// -------------------------

// 1. Helmet：增加 HTTP 標頭的安全性
app.use(helmet());

// 2. Compression：啟用 gzip 壓縮
app.use(compression());

// 3. CORS：允許跨域請求，這裡設置允許所有來源
app.use(cors());

// 4. Morgan：記錄 HTTP 請求，方便除錯
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('dev'));
app.use(
	morgan(
		':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]',
		{ stream: accessLogStream }
	)
);

const originalConsoleLog = console.log;
console.log = function (...args) {
	originalConsoleLog.apply(console, args);
	const logMessage = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
	accessLogStream.write(logMessage);
};

// 5. Body Parsing：解析 JSON 與 urlencoded 格式的請求負載
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Cookie Parser：解析 cookie
app.use(cookieParser());

// 7. 提供靜態檔案 (例如前端檔案)
app.use(express.static(path.join(__dirname, '../Client/dist')));

// -------------------------
// 掛載路由
// -------------------------

// API 路由 ( /api )
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../Client/dist/index.html'));
});

// -------------------------
// 404 及錯誤處理
// -------------------------

// 404 處理中介軟體 (捕捉所有無法處理的請求)
const notFound = require('./middleware/notFound');
app.use(notFound);

// 全局錯誤處理中介軟體
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;