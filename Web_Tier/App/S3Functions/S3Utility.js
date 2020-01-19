const aws = require("aws-sdk");
const s3 = new aws.S3({
    accessKeyId: AWS_CREDENTIALS.accessKeyId,
    secretAccessKey: AWS_CREDENTIALS.secretAccessKey,
    region: AWS_CREDENTIALS.region
});

module.exports = {
    getKeyObjectCounts: function (request, callback) {
        s3.getObject(request, callback);
    },
    putKeyObject: function (request, callback) {
        s3.putObject(request, callback);
    }
};