const awsSDK = require('aws-sdk');
const ec2 = new awsSDK.EC2({
    accessKeyId: AWS_CREDENTIALS.accessKeyId,
    secretAccessKey: AWS_CREDENTIALS.secretAccessKey,
    region: AWS_CREDENTIALS.region
});

const ec2Config = require("../Globals/EC2Config.js");
module.exports = {
    createInstance: function (instanceRequest, callback) {
        ec2.runInstances({
            ImageId: ec2Config.imageId,
            MinCount: instanceRequest.count,
            MaxCount: instanceRequest.count,
            InstanceType: ec2Config.instanceType,
            InstanceInitiatedShutdownBehavior: "terminate"
        }, callback)
    },
    countInstances: function (countInstanceRequest, callback) {
        ec2.describeInstances({}, function (err, data) {
                if (err) callback(err);
                else {
                    var count = 0;

                    for (iter in data.Reservations) {
                        for (var i = 0; i < data.Reservations[iter].Instances.length; i++) {
                            if (data.Reservations[iter].Instances[i].State.Name.toString() !== "terminated") {
                                count++;
                            }
                        }
                    }
                    callback(null, count);
                }
            }
        )
    }
}