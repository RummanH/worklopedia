const path = require('path');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const globalErrorHandler = require('./controllers/error.controller');
const corsOptions = require('./utils/corsOptions');
const apiV1Router = require('./routes/api.v1');
const adminRouter = require('./routes/admin.api');
const AppError = require('./utils/AppError');

const app = express();

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public', 'uploads')));

if (!process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Api routes
app.use('/api/v1', apiV1Router);
app.use('/api/admin', adminRouter);

// Handling unhandled routes
app.all('*', (req, res, next) =>
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404))
);

// All the errors that were passed to next() will directly go in this middleware
app.use(globalErrorHandler);

module.exports = app;
