const async = require("async");
const ec2Utility = require("../EC2Functions/EC2Utility.js");
const s3Utility = require("../S3Functions/S3Utility.js");
const sqsUtility = require("../SQSTools/SQSUtility.js");
const MAX_INTANCES = 20;

async.forever(function (next) {
    setTimeout(function () {
        async.waterfall([function (callback) {
            sqsUtility.getQueueAttributes({
                queueURL: AWS_SQS_INFO.queueURL
            }, function (error, data) {
                callback(error, data);
            })
        }, function (requestMessages, callback) {
            sqsUtility.getQueueAttributes({
                queueURL: AWS_SQS_INFO.responseQueueURL
            }, function (error, responseMessages) {
                callback(error, requestMessages, responseMessages);
            })
        }, function (requestMessages, responseMessages, callback) {
            ec2Utility.countInstances({}, function (error, instancesActive) {
                callback(error, requestMessages
                    , responseMessages, instancesActive);
            });
        }, function (requestMessages
            , responseMessages, instancesActive, callback) {
            var mapRequestInstances = 0;
            var sqsRequestInstances = parseInt(requestMessages['Attributes']
                ['ApproximateNumberOfMessages']) - (instancesActive - 1);

            var instancesRequired = Math.max(mapRequestInstances, sqsRequestInstances);
            var availableInstances = MAX_INTANCES - instancesActive;

            var runSize;
            if (instancesRequired >= 0) {
                runSize = Math.min(availableInstances, instancesRequired);
            } else {
                runSize = 0;
            }
            //console.log("instances required to spawn: " + runSize);
            LOGER.info("Instances required to spawn: " + runSize);
            if (runSize > 0) {
                ec2Utility.createInstance({
                    count: runSize
                }, function (error, data) {
                    setTimeout(function () {
                        if (error) {
                            LOGER.error("Not able to launch instances");
                            LOGER.error(error);
                            console.log(error);
                        }
                        else {
                            LOGER.info("instances launched");
                            //console.log(JSON.stringify(data));
                        }
                        callback();
                    }, 15000); //how much halt to start monitor again
                });
            }
            else {
                return callback();
            }

        }], function (error) {
            if (error) {
                LOGER.error(error);
            } else {
                next();
            }
        })
    }, 2000);
}, function (error) {

});