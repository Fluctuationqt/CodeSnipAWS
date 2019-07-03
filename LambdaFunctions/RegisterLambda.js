const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    const requestBody = JSON.parse(event.body);

    let newUser = createUser(requestBody);

    write(newUser).then(() => {
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({statusCode: 200, message: "User registered", body: newUser}),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        if (err.code === 'ConditionalCheckFailedException') {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify({statusCode: 409, message: 'Username taken'}),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

function write(user) {
    return ddb.put({
        TableName: 'users',
        Item: user,
        ConditionExpression: 'attribute_not_exists(username)',
    }).promise();
}


function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            statusCode: 500,
            message: errorMessage
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}

function createUser(body) {
    return {
        username: body.username,
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        password: body.password,
    };
}
