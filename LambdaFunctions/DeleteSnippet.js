const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);


    let username = requestBody.username;
    let token = requestBody.token;
    let snippet_id = requestBody.id;

    checkLoggedStatus(username, token, callback).then((logged) => {
        if (logged) {
            checkSnippetOwner(username, snippet_id, callback).then((isOwner) => {
                if (isOwner) {
                    deleteSnippet(username, snippet_id, callback);
                } else {
                    reply(400, 'You dont own this snippet', {}, callback);
                }
            })
        } else {
            reply(500, 'Please login first.', {}, callback);
        }
    });
};

function deleteSnippet(username, snippet_id, callback) {
    var params = {
        TableName: 'snippets',
        Key: {
            "username": username,
            "id": snippet_id
        }
    };
    ddb.delete(params).promise().then(() => {
        reply(200, 'Delete successful', null, callback);
    }).catch((err) => {
        reply(500, 'Delete unsuccessful', JSON.stringify(err, null, 2), callback);
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

// returns true if user owns snippet with given id
function checkSnippetOwner(username, snippet_id, callback) {
    let params = {
        TableName: 'snippets',
        Key: {
            username: username,
            id: snippet_id
        }
    };

    return ddb.get(params, function (err, data) {
        return err ? null : data;
    }).promise().then((data) => {
        return data.Item.username == username;
    }).catch((err) => {
        reply(500, 'Error fetching snippet', {error: err}, callback);
        return false;
    });
}

// Replays with json:{statusCode: replyCode, message: replyMessage, body: replyBody}
function reply(replyCode, replyMessage, replyBody, callback) {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({statusCode: replyCode, message: replyMessage, body: replyBody}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
