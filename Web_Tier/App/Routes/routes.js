module.exports = function (app) {
    app.get('/', function (request, response) {
        response.send({
            "message": "Hello there!!! Use this api like /cloudimagerecognition?input=[url]"
        })
    });
    app.get('/cloudimagerecognition', require("../RequestHandlers/ImageURLRequest"));
};