const express = require('express');

const numCPUs = require("os").cpus().length;
const cluster = require("cluster");
const winston = require("winston");
const retry = require('retry');
require('winston-daily-rotate-file');

AWS_CREDENTIALS = require("./Globals/credentials");
SQS_UTIL = require("./SQSTools/SQSUtility");
AWS_SQS_INFO = require("./Globals/SQSVars");
REQUEST_MAP = {};
var transport = new (winston.transports.DailyRotateFile)({
    filename: '/var/log/tempLogs/log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    level: process.env.ENV === 'development' ? 'debug' : 'info'
});
S3_INFO = require("./Globals/S3Config.js");

LOGER = new (winston.Logger)({
    transports: [
        transport
    ]
});

if (cluster.isMaster) {
    const operation = retry.operation();
    operation.attempt(function (attempt) {
        try {
            require("./Monitor/Monitor.js");
        } catch (err) {
            console.log(err);
            operation.retry(err);
            return;
        }
        operation.retry(null);
    });
    for (var i = 0; i < 1; i++) {
        cluster.fork()
    }
    cluster.on('exit', function (worker, code, signal) {
        try {
            LOGER.info('worker node died: ' + worker.process.i);
            LOGER.info('problem with the died node: ' + code);
            LOGER.info('signal for the died node:' + signal);
            cluster.fork();
            LOGER.info("respawned the worker");
        } catch (e) {
            LOGER.error(e)
        }
    })
} else {
    const app = express();
    var routesFunction = require("./Routes/routes.js")(app);
    app.listen(9000, function () {
        LOGER.info("Started a request thread");
        console.log("Server started at port 9000 for this child. Look at the log files for debugging")
    })
}
