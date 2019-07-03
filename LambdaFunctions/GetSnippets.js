const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let queryParams = event.queryParameters;

    if(queryParams.id) {
        GetSnippetById(queryParams.id);
    }else if(queryParams.username) {
        GetSnippetByCreator(event.queryParameters.username);
    }else {
        GetAllSnippets(callback);
    }
};

function GetSnippetById(id, callback){
    var params = {
        TableName : 'snippets',
        Key: {
            snippet_id: snippetId
        }
    };

    ddb.get(params, function(err, data) {
        return err ? null : data;
    }).promise().then((data) => {
        reply(200, 'Snippet fetched successfully', {snippet: data}, callback);
    }).catch((err) => {
        reply(500, 'Error fetching snippet', {error: err}, callback);
    });
}

function GetSnippetByCreator(username, callback){
    // TODO:
}

function GetAllSnippets(callback){
    // TODO:
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
