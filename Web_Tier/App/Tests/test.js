const data = require("./tests.json").slice(0, 10); //sliced data so that we don't exceed the limits
const url = "http://52.53.199.40/cloudimagerecognition?input=http://visa.lab.asu.edu/cifar-10/";
const async = require("async");
const fetch = require("node-fetch");
console.log(data);
async.each(data, function (element, callback) {
    fetch(url + element).then(function (response) {
        response.json().then(function (json) {
            console.log(json);
            callback();
        })
    }).catch(function (error) {
        console.log(error);
        callback();
    })
}, function (error, result) {
    console.log(error);
});

