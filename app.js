const createError = require('http-errors');
const express = require('express');
const indexRouter = require('./routes/index');
const app = express();
const listenPort = process.env.PORT || 3000;

app.use('/', indexRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).send();
});


app.enable('trust proxy');
app.listen(listenPort, '0.0.0.0', function(){
  console.log('listening on port ' + listenPort);
});

module.exports = app;
