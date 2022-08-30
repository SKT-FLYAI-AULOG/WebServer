$(document).ready(() => {
    setEvent();
});

function setEvent() {
    try {
        let idInput = document.querySelector("#registerId");
        let pwInput = document.querySelector("#registerPw");
        let pwCheckInput = document.querySelector("#registerPw2");
        let nickInput = document.querySelector("#registerNick");
        let requestBtn = document.querySelector("#requestRegister");

        idInput.addEventListener("change", idCheck);
        pwCheckInput.addEventListener("change", pwCheck);
        requestBtn.addEventListener("click", requestRegister);
        nickInput.addEventListener("change", nickCheck);
    }
    catch {

    }
}

function requestRegister() {
    let idInput = document.querySelector("#registerId");
    let pwInput = document.querySelector("#registerPw");
    let pwCheckInput = document.querySelector("#registerPw2");
    let nickInput = document.querySelector("#registerNick");
    let emailInput = document.querySelector("#registerEmail");
    let emailInputDomain = document.querySelector("#registerEmailDomain");

    if (idInput.classList.contains("is-invalid") || idInput.value === "") {
        printAlert("아이디를 확인해주세요.");
    }
    else if (pwCheckInput.classList.contains("is-invalid") || pwCheckInput.value === "") {
        printAlert("비밀번호를 확인해주세요.");
    }
    else if (nickInput.classList.contains("is-invalid") || nickInput.value === "") {
        printAlert("닉네임을 확인해주세요.");
    }
    else if (emailInput.value === "") {
        printAlert("이메일을 확인해주세요.");
    }
    else {
        let data = {
            id: idInput.value,
            pw: CryptoJS.MD5(pwInput.value).toString(),
            email: emailInputDomain.selectedIndex === 0 ? emailInput.value : emailInput.value + emailInputDomain.options[emailInputDomain.selectedIndex].innerHTML,
            nick: nickInput.value
        }
        $.ajax({
            type: "POST",
            url: "/register",
            data: data,
            success: (res) => {
                if (res.ok) {
                    $('#dialog').modal('show');
                }
                else {
                    printAlert(res.msg);
                }
            },
            error: (err) => {
                printAlert(err.msg);
            }
        });
    }
}

function dialogOk() {
    window.location.href = '/login';
}

function printAlert(text, warn=true) {
    let divAlert = document.querySelector('#div-alert');
    let alertElement = document.createElement('div');
    let textDiv = document.createElement('div');
    alertElement.classList.add('alert');
    alertElement.classList.add(warn ? 'alert-danger' : 'alert-success');
    alertElement.classList.add('d-flex');
    alertElement.classList.add('align-items-center');
    alertElement.setAttribute('role', 'alert');
    textDiv.innerHTML = text;
    alertElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>`;
    alertElement.appendChild(textDiv);
    

    divAlert.innerHTML = '';
    divAlert.appendChild(alertElement);
}

function idCheck() {
    let idInput = document.querySelector("#registerId");
    let idLabel = document.querySelector("#registerIdLabel");
    $.ajax({
        type: "POST",
        url: "/idcheck",
        data: {id: idInput.value},
        success: (res) => {
            if (res.ok) {
                idLabel.innerHTML = "아이디";
                idInput.classList.remove("is-invalid");
            }
            else {
                idLabel.innerHTML = "이미 존재하는 아이디입니다.";
                idInput.classList.add("is-invalid");
            }
        },
        error: (err) => {

        }
    });
}
function nickCheck() {
    let nickInput = document.querySelector("#registerNick");
    let nickLabel = document.querySelector("#registerNickLabel");
    $.ajax({
        type: "POST",
        url: "/nickcheck",
        data: {nick: nickInput.value},
        success: (res) => {
            if (res.ok) {
                nickLabel.innerHTML = "닉네임";
                nickInput.classList.remove("is-invalid");
            }
            else {
                nickLabel.innerHTML = "이미 존재하는 닉네임입니다.";
                nickInput.classList.add("is-invalid");
            }
        },
        error: (err) => {

        }
    });
}

function pwCheck() {
    let pwInput = document.querySelector("#registerPw");
    let pwCheckInput = document.querySelector("#registerPw2");
    let pwCheckLabel = document.querySelector("#registerPw2Label");

    if (pwInput.value !== pwCheckInput.value) {
        pwCheckLabel.innerHTML = "비밀번호를 확인해주세요.";
        pwCheckInput.classList.add("is-invalid");
    }
    else {
        pwCheckLabel.innerHTML = "비밀번호 확인";
        pwCheckInput.classList.remove("is-invalid");
    }
}

function loginPasswordToMD5() {
    let pw = document.querySelector("#loginPwInput");
    pw.value = CryptoJS.MD5(pw.value).toString();
    return true;
}