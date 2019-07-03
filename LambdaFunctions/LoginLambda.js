const AWS = require('aws-sdk');
const crypto = require("crypto");

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    const requestBody = JSON.parse(event.body);

    let user = createUser(requestBody);

    var params = {
        TableName: 'users',
        Key: {
            username: user.username
        }
    };

    ddb.get(params, function (err, data) {
        return err ? null : data;
    }).promise().then((data) => {
        const dbUser = data.Item;
        console.log('USER', dbUser);
        if (dbUser != null
            && dbUser.username === user.username
            && dbUser.password === user.password) {
            createToken(dbUser.username, callback);
        } else {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    statusCode: 409,
                    message: "Account not found",
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

function createUser(body) {
    return {
        username: body.username,
        password: body.password
    };
}


function createToken(username, callback) {
    let token = crypto.randomBytes(16).toString("hex");
    ddb.put({
        TableName: 'tokens',
        Item: {
            token: token,
            username: username,
        },
    }).promise().then(() => {
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({statusCode: 200, message: 'Logged in sucessfully', body: {token: token, username: username}}),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
}

function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            statusCode: 500,
            message: errorMessage,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
