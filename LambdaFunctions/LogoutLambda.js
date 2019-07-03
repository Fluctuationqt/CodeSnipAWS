const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);
    let token = requestBody.token;

    var params = {
        TableName: 'tokens',
        Key: {
            "token": token,
        }
    };

    ddb.delete(params).promise().then(() => {
        reply(200, 'Logout successful', {}, callback);
    }).catch((err) => {
        reply(500, 'Logout unsuccessful', {error: err}, callback);
    });
};

// Replys with json:{statusCode: replyCode, message: replyMessage, body: replyBody}
function reply(replyCode, replyMessage, replyBody, callback){
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            statusCode: replyCode,
            message: replyMessage,
            body: replyBody
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
