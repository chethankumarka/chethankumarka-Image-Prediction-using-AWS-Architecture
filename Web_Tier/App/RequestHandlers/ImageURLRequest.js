const AWS = require("aws-sdk");
const validURl = require("valid-url");
const s3Utility = require("../S3Functions/S3Utility.js");
const retry = require('retry');
const sqsUtility = require("../SQSTools/SQSUtility.js");
const async = require("async");
module.exports = function (request, response) {
    LOGER.info("Request for cloudimagerecognition")
    if (!request.query || !request.query.input) {
        response.status(400).send({
            "message": "Hello there!!! Use this api like /cloudimagerecognition?input=[valid-url]"
        });
        LOGER.info("Empty request by the user for cloudimagerecognition");
    } else if (request.query && request.query.input && !validURl.isUri(request.query.input + "")) {
        response.status(400).send({
            "message": "Opps!!! url not valid"
        });
        LOGER.info("Incorrect request by the user for cloudimagerecognition: " + request.query.input);
    } else {
        LOGER.info("Valid request by the user: " + request.query.input);
        const operation = retry.operation();
        var uuid = require("uuid/v1");
        var reqId = uuid();
        var message = {
            requestUUID: reqId,
            imageURL: request.query.input,
            queueURL: AWS_SQS_INFO.queueURL
        };

        async.waterfall([function (callback) {
            var imageName = request.query.input.split("/");
            imageName = imageName[imageName.length - 1];
            var params = {
                Key: imageName,
                Bucket: S3_INFO.bucketName
            };
            s3Utility.getKeyObjectCounts(params, function (error, data) {
                if (error) {
                    callback(null, true, null)
                } else {
                    callback(null, false, data['Body'].toString())
                }
            })
        }, function (processingRequired, answer, callback) {
            if (!processingRequired) {
                LOGER.info("No processing required: " + answer + " url: " + request.query.input)
                response.send({
                    requestId: reqId,
                    answer: answer
                });
                return callback();
            } else {
                operation.attempt(function (currentAttempt) {
                    SQS_UTIL.insertMessageIntoSQS(message, function (err, data) {
                        if (operation.retry(err)) {
                            LOGER.info("Something failed in SQS insert");
                            LOGER.warn(err);
                            return;
                        }
                        if (err) {
                            LOGER.error("Attempt to push in SQS Failed: " + request.query.input);
                            response.status(500).send({
                                message: "Not able to put the job in the queue"
                            });
                            return callback();
                        } else {
                            REQUEST_MAP[reqId] = response;
                            LOGER.info("Attempt Successfull for query: " + reqId + " Image:" + request.query.input);
                            return callback();
                        }
                    });
                });
            }
        }], function (error, data) {
            if (error)
                LOGER.error(error);
            else
                LOGER.info(data);
        });
    }
};


//Check my request map if something has been
// fulfilled
async.forever(function (next) {
    async.waterfall([function (callback) {
        sqsUtility.getQueueAttributes({
            queueURL: AWS_SQS_INFO.responseQueueURL
        }, function (error, data) {
            callback(error, data);
        })
    }, function (isRequiredProcessingData, callback) {
        var responseMessage = isRequiredProcessingData['Attributes']['ApproximateNumberOfMessages'];
        if (responseMessage == 0) {
            return callback();
        } else {
            sqsUtility.retrieveMessageFromSQS({
                queueURL: AWS_SQS_INFO.responseQueueURL,
                messageCount: 10
            }, function (error, data) {
                if (!data['Messages'] || !data['Messages'].length) {
                    return callback();
                }
                var deleteBatch = {
                    queueURL: AWS_SQS_INFO.responseQueueURL,
                    entries: []
                };

                async.eachSeries(data['Messages'], function (message, innerCallback) {
                    message['Body'] = JSON.parse(message['Body']);
                    if (REQUEST_MAP[message['Body']["requestUUID"]]) {
                        if (!REQUEST_MAP[message['Body']["requestUUID"]]._headerSent) {
                            REQUEST_MAP[message['Body']["requestUUID"]].send({
                                answer: message['Body']["result"],
                                requestId: message['Body']["requestUUID"]
                            });
                        }
                    }
                    delete REQUEST_MAP[message['Body']["requestUUID"]];
                    deleteBatch.entries.push({
                        ReceiptHandle: message['ReceiptHandle'],
                        Id: message['MessageId']
                    });
                    return innerCallback();
                }, function (error) {
                    if (error)
                        LOGER.error(error);
                    if (deleteBatch.entries.length) {
                        sqsUtility.deleteMessageBatch(deleteBatch, function (error, data) {
                            if (error)
                                LOGER.error(error);
                            else {
                                LOGER.info("response recieved and message deleted from response queue");
                                LOGER.info(data)
                            }
                        });
                    }
                    return callback();
                });
            });
        }
    }], function (error) {
        setTimeout(function () {
            next();
        }, 1000);
    })
});

// check from another sqs whether response is ready and if yes send response
