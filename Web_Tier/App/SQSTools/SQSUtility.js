const AWS = require("aws-sdk");
const sqs = new AWS.SQS({
    "accessKeyId": AWS_CREDENTIALS.accessKeyId,
    "secretAccessKey": AWS_CREDENTIALS.secretAccessKey,
    "region": AWS_CREDENTIALS.region
});

module.exports = {
    createSQSQueue: function (queueConfigParams, callback) {
        var requestQueueParams = {
            QueueName: queueConfigParams.queueName, /* required */
            Attributes: {
                'ReceiveMessageWaitTimeSeconds': queueConfigParams.receieveWaitTime,
                'VisibilityTimeout': queueConfigParams.visibilityTimeout
                /* '<QueueAttributeName>': ... */
            }
        };
        sqs.createQueue(requestQueueParams, function (err, data) {
            if (err) {
                //console.log(err, err.stack); // an error occurred
                LOGER.info('SQS Request Queue Not Created: ' + err.toString());
                LOGER.info('Error Stack Trace: ' + err.stack.toString());
                callback(err, null);
            } else {
                //console.log(data);
                LOGER.info(requestQueueParams['QueueName'] + 'Created Successfully');
                callback(null, data);
            }
        });
    },
    returnQueueURL: function (queueConfigParams, callback) {
        var queueURLParams = {
            QueueName: queueConfigParams.queueName,
            QueueOwnerAWSAccountId: queueConfigParams.AWSAccountId
        }
        sqs.getQueueUrl(queueURLParams, function (err, data) {
            if (err) {
                //console.log(err, err.stack); // an error occurred
                LOGER.info('Could Not Fetch QueueURL: ' + err.toString());
                LOGER.info('Error Stack Trace: ' + err.stack.toString());
                callback(err, null);
            } else {
                //console.log(data);
                LOGER.info(queueConfigParams.queueName + 'Fetched Successfully');
                callback(null, data);
            }
        });
    },
    insertMessageIntoSQS: function (imageRecognitionRequest, callback) {

        var queueMessage = {
            uuid: imageRecognitionRequest.requestUUID,
            ImageURL: imageRecognitionRequest.imageURL
        };

        var requestQueueParams = {
            MessageBody: JSON.stringify(queueMessage), /* required */
            QueueUrl: imageRecognitionRequest.queueURL, /* required */
            DelaySeconds: 0
        };
        sqs.sendMessage(requestQueueParams, function (err, data) {
            if (err) {
                //console.log(err, err.stack); // an error occurred
                LOGER.info('Could Not Send Message: ' + err.toString());
                LOGER.info('Error Stack Trace: ' + err.stack.toString());
                callback(err, null);
            } else {
                //console.log(data);
                LOGER.info(imageRecognitionRequest.imageURL + 'Added Successfully');
                callback(null, data);
            }
        });
    },
    retrieveMessageFromSQS: function (queueConfigParams, callback) {

        var receiveParams = {
            QueueUrl: queueConfigParams.queueURL,
            AttributeNames: [],
            MaxNumberOfMessages: 10,
            VisibilityTimeout: 4,
            WaitTimeSeconds: 4
        };
        sqs.receiveMessage(receiveParams, function (err, data) {
            if (err) {
                //console.log(err, err.stack); // an error occurred
                LOGER.info('Could Not Receive Message: ' + err.toString());
                LOGER.info('Error Stack Trace: ' + err.stack.toString());
                callback(err, null);
            } else {
                //console.log(data);
                LOGER.log("Data recieved from sqs response queue");
                callback(null, data);
            }
        });
    },
    getQueueAttributes: function (queueConfigParams, callback) {
        var queueAttributeParams = {
            QueueUrl: queueConfigParams.queueURL, /* required */
            AttributeNames: [
                'ApproximateNumberOfMessages'
            ]
        };
        sqs.getQueueAttributes(queueAttributeParams, function (err, data) {
            if (err) {
                //console.log(err, err.stack); // an error occurred
                LOGER.info('Could Not Get Queue Attributes: ' + err.toString());
                LOGER.info('Error Stack Trace: ' + err.stack.toString());
                callback(err, null);

            } else {
                //console.log(data);           // successful response
                LOGER.info('Successfully Fetched Queue Attributes: ');
                LOGER.info('Attributes Retreived Successfully');
                callback(null, data);

            }
        });
    },
    deleteMessageBatch: function (deleteBatchRequest, callback) {
        var params = {
            Entries: deleteBatchRequest.entries,
            QueueUrl: deleteBatchRequest.queueURL
        };
        sqs.deleteMessageBatch(params, function (err, data) {
            if (err) {
                callback(err);
            }
            else {
                //console.log(data);
                callback(null, data);
            }
        });
    }
}

