$(document).ready(() => {
    setEvent();
});

function setEvent() {
    let loginInput = document.querySelector("#registerId");
    let pwInput = document.querySelector("#registerPw");
    let pwCheckInput = document.querySelector("#registerPw2");
    let requestBtn = document.querySelector("#requestRegister");

    loginInput.addEventListener("change", idCheck);
    pwCheckInput.addEventListener("change", pwCheck);
    requestBtn.addEventListener("click", requestRegister);
}

function requestRegister() {
    printAlert("가입에 실패했습니다.");
}

function printAlert(text) {
    let divAlert = document.querySelector('#div-alert');
    let alertElement = document.createElement('div');
    let textDiv = document.createElement('div');
    alertElement.classList.add('alert');
    alertElement.classList.add('alert-danger');
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

}

function pwCheck() {
    let pwInput = document.querySelector("#registerPw");
    let pwCheckInput = document.querySelector("#registerPw2");
    let pwCheckLabel = document.querySelector("#registerPw2Label");

    console.log(pwInput.value, pwCheckInput.value)
    if (pwInput.value !== pwCheckInput.value) {
        pwCheckLabel.innerHTML = "비밀번호를 확인해주세요.";
        pwCheckInput.classList.add("is-invalid");
    }
    else {
        pwCheckLabel.innerHTML = "비밀번호 확인";
        pwCheckInput.classList.remove("is-invalid");
    }
}