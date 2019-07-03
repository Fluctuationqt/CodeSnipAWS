function deleteSnippet(token, username, snippetId) {

    Swal.fire({
        title: 'Внимание',
        text: "Сигурни ли сте, че искате да изтриете този код? Действието не може да бъде върнато!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Изтрии',
        cancelButtonText: 'Отказ'
    }).then((result) => {
        if (result.value) {
            var formData = {
                token: token,
                username: username,
                id: snippetId,
            };
            makeAjaxRequest(
                invokeUrl + '/snippets',
                "DELETE",
                JSON.stringify(formData),
                function (jdata) {
                    if (jdata.statusCode >= 200 && jdata.statusCode < 400) {
                        $("#" + snippetId).detach();
                        Swal.fire({
                            title: 'Успшно!',
                            text: 'Успешно изтрихте вашето парче код!',
                            type: 'success',
                        });
                    } else if (jdata.statusCode >= 400 && jdata.statusCode < 500) {
                        Swal.fire({
                            title: 'Внимание!',
                            text: 'Нямате право да изтриете това парче код!',
                            type: 'error',
                        });
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
    });
}

function appendSnippet(snippet) {

    var holder = $('#accordion'),
        temp = $('#tempSnippet');

    var newSnippet = temp.clone();

    newSnippet.attr('id', snippet.id);
    newSnippet.find('[data-id="title"]').attr('data-target', "#body_" + snippet.id);
    newSnippet.find('#snippetBody').attr('id', "body_" + snippet.id);
    newSnippet.find('[data-id="title"]').html(snippet.title);
    newSnippet.find('[data-id="lang"]').html(snippet.lang);
    newSnippet.find('[data-id="content"]').text(snippet.content);
    newSnippet
        .find('[data-id="snippetUrl"]')
        .val(window.location.hostname +
            '/preview.html?' +
            'username=' + getCookie('username') +
            '&id=' + snippet.id
        )
        .on('keypress', function (e) {
            e.preventDefault();
        })
        .on('focus', function () {
            $(this).select();
        });
    newSnippet.find('[data-id="deleteSnippet"]').on('click', function (event) {
        event.preventDefault();
        deleteSnippet(getCookie('token'), getCookie('username'), snippet.id);
    });

    newSnippet.removeClass('d-none');

    holder.append(newSnippet);

    hljs.highlightBlock(newSnippet.find('[data-id="content"]')[0]);
}

function showSnippets(snippets) {

    snippets.forEach((snippet) => appendSnippet(snippet));
}


function getSnippets() {
    makeAjaxRequest(
        invokeUrl + '/snippets?username=' + getCookie('username'),
        "GET",
        "",
        function (jdata) {
            if (jdata.statusCode >= 200 && jdata.statusCode <= 400) {
                var snippets = jdata.body.snippets.Items;
                if (snippets.length > 0) {
                    showSnippets(snippets);
                } else {
                    $('#errorMessageNoSnippets').removeClass('d-none');
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


$(function () {

    $("#logoutForm").on('click', function (event) {
        event.preventDefault();

        var postData = {
            'token': getCookie('token'),
            'username': getCookie('username'),
        };

        makeAjaxRequest(
            invokeUrl + '/logout',
            "POST",
            JSON.stringify(postData),
            function (jdata) {
                if (jdata.statusCode >= 200 && jdata.statusCode <= 400) {
                    setCookie('token', '', 0);
                    setCookie('username', '', 0);
                    window.location.replace('index.html');
                } else if (jdata.statusCode >= 400 && jdata.statusCode < 500) {
                    Swal.fire({
                        title: 'Внимание!',
                        text: jdata.message,
                        type: 'warning',
                    });
                } else {
                    Swal.fire({
                        title: 'Грешка!',
                        text: 'Презаредете страницата и опитайте отново!',
                        type: 'error',
                    });
                }
            }
        );
        return false;
    });

    $("#createSnippetForm").on('submit', function (event) {
        event.preventDefault();

        var form = $(this)[0];
        var data = new FormData(form);
        data.append('username', getCookie('username'));
        data.append('token', getCookie('token'));

        var postData = {};
        for (var pair of data.entries()) {
            postData[pair[0]] = pair[1];
        }

        makeAjaxRequest(
            invokeUrl + '/snippets',
            "POST",
            JSON.stringify(postData),
            function (jdata) {
                if (jdata.statusCode >= 200 && jdata.statusCode <= 400) {
                    Swal.fire({
                        title: 'Страхотно!',
                        text: "Добавихте парче код към Вашия профил!",
                        type: 'success',
                    }).then(function () {
                        form.reset();
                        $('#addSnippet').click();
                        $('#errorMessageNoSnippets').addClass('d-none');
                        appendSnippet(jdata.body);
                    });
                } else {
                    Swal.fire({
                        title: 'Грешка!',
                        text: 'Презаредете страницата и опитайте отново!',
                        type: 'error',
                    });
                }
            }
        )
    });

    $('#accordion').on('show hide', function () {
        $(this).css('height', 'auto');
    });

    getSnippets();
});
