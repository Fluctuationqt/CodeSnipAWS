var invokeUrl = 'https://42tnl37ova.execute-api.eu-central-1.amazonaws.com/prod';

function showSpinner() {
    $("#loading_div, #loading_gif").show();
}

function hideSpinner() {
    $("#loading_div, #loading_gif").hide();
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function login(form) {
    var data = new FormData(form);
    var postData = {};
    for(var pair of data.entries()) {
        postData[pair[0]] = pair[1];
    }

    console.log(postData);
    makeAjaxRequest(
        invokeUrl + '/login',
        "POST",
        JSON.stringify(postData),
        function (jdata) {
            if (jdata.statusCode >= 200 && jdata.statusCode <= 400) {
                setCookie('token', jdata.body.token, 1);
                setCookie('username', jdata.body.username, 1);
                Swal.fire({
                    title: 'Успешен вход!',
                    text: 'Добре дошли в CodeSnip!',
                    type: 'success',
                }).then(function() {
                    window.location.replace('dashboard.html');
                });
            } else if (jdata.statusCode >= 400 && jdata.statusCode < 500) {
                Swal.fire({
                    title: 'Внимание!',
                    text: 'Невалидни данни!',
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
}


function makeAjaxRequest(url, type, data, successCallback, errorCallback, completeCallback) {

    showSpinner();

    $.ajax({
        url: url,
        type: type,
        data: data,
        dataType: 'json',
        crossDomain: true,
        contentType: "application/json",
        success: function (data, status, xhr) {
            console.log(data);
            successCallback(data, status, xhr);
        },
        error: function (xhr, status, error) {
            console.log(error);
            errorCallback(xhr, status, error);
        },
        complete: function () {
            if (typeof completeCallback === "function") {
                completeCallback();
            }
            hideSpinner();
        }
    });
}

$(function () {

    var loginForm = $("#loginForm"),
        logoutForm = $("#logoutForm"),
        navItems = $("#navItems"),
        jumbotron = $("#jumbotron"),
        fastNav = $("#fastNav"),
        welcomeMessage = $("#welcomeMessage"),
        errorMessage = $("#errorMessageLogin"),
        mainDashboard = $("#mainDashboard");

    // Navigation menu
    if (getCookie("token")) {
        navItems.removeClass('d-none');
        loginForm.detach();
        logoutForm.removeClass('d-none');
        jumbotron.detach();
        fastNav.removeClass('d-none');
        mainDashboard.removeClass('d-none');

        var username = getCookie("username");
        if (username) welcomeMessage.append(", " + username);
    } else {
        errorMessage.removeClass('d-none');
        mainDashboard.detach();
        navItems.detach();
        loginForm.removeClass('d-none');
        logoutForm.detach();
        jumbotron.removeClass('d-none');
        fastNav.detach();
    }

    loginForm.on('submit', function (event) {
        event.preventDefault();
        login($(this)[0]);
    });
});

