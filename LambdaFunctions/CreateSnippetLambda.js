const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const crypto = require("crypto");

exports.handler = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);
    let snippet = createSnippet(requestBody);
    let token = requestBody.token;
    let username = requestBody.username;

    checkLoggedStatus(username, token, callback).then((isLogged) => {
        if (isLogged) {
            ddb.put({
                TableName: 'snippets',
                Item: snippet,
            }).promise().then(() => {
                reply(200, 'Snippet Created successfully.', snippet, callback);
            }).catch((err) => {
                reply(500, 'Failed Snippet Creation.', {error: err}, callback);
            });
        } else {
            reply(400, 'Please login', {}, callback);
        }
    })
};

// Maps request data to db object
function createSnippet(body) {
    return {
        id: crypto.randomBytes(16).toString("hex"),
        username: body.username,
        title: body.title,
        content: body.content,
        lang: body.lang
    };
}

// Replys with json:{statusCode: replyCode, message: replyMessage, body: replyBody}
function reply(replyCode, replyMessage, replyBody, callback){
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({statusCode: replyCode, message: replyMessage, body: replyBody}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}

// returns true if username, token are of a logged user
function checkLoggedStatus(username, token, callback) {
    let params = {
        TableName: 'tokens',
        Key: {
            "token": token,
        }
    };

    return ddb.get(params, function (err, data) {
        return err ? false : data;
    }).promise().then((data) => {
        return data.Item.username == username && data.Item.token == token;
    }).catch((err) => {
        reply(500, 'Error fetching login status', {error: err}, callback);
        return false;
    });
}
