function checkValidity(form) {
    var isValid = true;
    $.each(form.find('input'), function () {
        if ($(this).val().length === 0) {
            isValid = false;
            $(this).addClass('is-invalid');
        }
        if ($(this).hasClass('is-invalid')) {
            isValid = false;
        }
    });
    return isValid;
}

$(function () {

    if (getCookie("token")) {
        window.location.replace('index.html');
    }
    var registerForm = $("#registerForm");

    registerForm.on('submit', function (event) {
        event.preventDefault();

        if (!checkValidity($(this))) return false;

        var data = new FormData(registerForm[0]);
        var postData = {};
        for(var pair of data.entries()) {
            postData[pair[0]] = pair[1];
        }

        makeAjaxRequest(
            invokeUrl + '/register',
            "POST",
            JSON.stringify(postData),
            function (jdata) {
                if (jdata.statusCode >= 200 && jdata.statusCode <= 400) {
                    Swal.fire({
                        title: 'Поздравления!',
                        text: 'Вашата регистрация е успешна. Може да влезете във Вашия профил.',
                        type: 'success',
                    }).then(function() {
                        window.location.replace('index.html');
                    });
                } else if (jdata.statusCode >= 400 && jdata.statusCode < 500) {
                    Swal.fire({
                        title: 'Внимание!',
                        text: 'Потребителското име е заето!',
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

    // Firstname, lastname and username validate
    $('#firstName, #lastName, #username').on('focusout keyup', function () {
        var inputLength = $(this).val().length;

        if (inputLength < 3 || inputLength > 20) {
            $(this).removeClass('is-valid');
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
            $(this).addClass('is-valid');
        }
    });

    // Email validate
    $('#email').on('focusout keyup', function () {
        var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailPattern.test($(this).val())) {
            $(this).removeClass('is-valid');
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
            $(this).addClass('is-valid');
        }
    });

    // Password validate
    $('#password').on('focusout keyup', function () {
        var inputLength = $(this).val().length;

        if (inputLength < 3 || inputLength > 20) {
            $(this).removeClass('is-valid');
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
            $(this).addClass('is-valid');
        }
    });

    // Password confirm validate
    $('#confirmPassword').on('focusout keyup', function () {
        if ($('#password').val() !== $(this).val()) {
            $(this).removeClass('is-valid');
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
            $(this).addClass('is-valid');
        }
    });
});
