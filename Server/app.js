if (typeof BigInt.prototype.toJSON !== 'function') {
	BigInt.prototype.toJSON = function () {
		return this.toString();
	};
}

const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(helmet());

app.use(compression());

app.use(cors());

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../Client/dist')));

app.use((req, res, next) => {
	// res.setHeader("Content-Security-Policy", "script-src 'self' https://cdnjs.cloudflare.com; object-src 'none'");
	res.setHeader("Content-Security-Policy", "script-src 'self' https://cdnjs.cloudflare.com; script-src-elem 'self' https://cdnjs.cloudflare.com; object-src 'none'");
	next();
});

const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../Client/dist/index.html'));
});

const notFound = require('./middleware/notFound');
app.use(notFound);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;