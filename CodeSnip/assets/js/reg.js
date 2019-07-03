const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    const requestBody = JSON.parse(event.body);

    //let newUser = createUser(requestBody);

    write(requestBody.username, requestBody.email, requestBody.first_name,
        requestBody.last_name, requestBody.password).then(() => {
        callback(null, {
            statusCode: 201,
            body: 'created',
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

function write(username, email, first_name, last_name, password) {
    return ddb.put({
        TableName: 'users',
        Item: {
            username: username,
            email: email,
            first_name: first_name,
            last_name: last_name,
            password: password,
        },
    }).promise();
}


function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
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


//TODO:  WORKING GET REQUEST
$.ajax({

    // The 'type' property sets the HTTP method.
    // A value of 'PUT' or 'DELETE' will trigger a preflight request.
    type: 'GET',
    // The URL to make the request to.
    url: 'https://42tnl37ova.execute-api.eu-central-1.amazonaws.com/prod/snippets',
    crossDomain: true,
    contentType: 'text/plain',
});

console.log('clicked');
