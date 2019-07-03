$(function () {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const username = urlParams.get('username');
    getSnippet(username, id);
});

function getSnippet(username, id) {
    makeAjaxRequest(
        invokeUrl + '/snippets?username=' + username + '&id=' + id,
        "GET",
        "",
        function (jdata) {
            if (jdata.statusCode >= 200 && jdata.statusCode <= 400) {
                var snippet = jdata.body.snippet.Item;
                snippet.email = jdata.body.email;
                if (snippet) {
                    showSnippet(snippet);
                } else {
                    showError();
                }
            } else {
                Swal.fire({
                    title: 'Грешка!',
                    text: 'Презаредете страницата и опитайте отново!',
                    type: 'error',
                });
            }
        }
    );
}

function showSnippet(data) {
    console.log(data);
    var snippet = $("#snippet");
    snippet.find('#title').html(data.title);
    snippet.find('#lang').html(data.lang);
    snippet.find('#creator').html(data.username).attr('href', 'mailto:' + data.email);
    snippet.find('#code').html(data.content);
    //hljs.highlightBlock(snippet.find('#code'));
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });

    snippet.removeClass('d-none');
}

function showError() {
    $('#error').removeClass('d-none');
}
