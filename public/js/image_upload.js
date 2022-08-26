let fileLists = [];

function uploadFileAdded() {
    clearImageDiv();
    let uploadFiles = document.getElementById("uploadImgInput")
    fileLists = Array.from(uploadFiles.files)
    for (let i = 0; i < fileLists.length; i++) {
        let file = fileLists[i];
        createImageDiv(file, i);
        // 비동기 파일 업로드를 시작한다.
        //var uploader = new Uploader(file);
        //uploader.startUpload();
    }
    // 폼을 리셋해서 uploadFiles에 출력된 선택 파일을 초기화시킨다.
    document.getElementById("uploadImgInput").value = "";
};

function refreshUploadFiles() {
    let imgList = document.querySelector("#div-upload-image");
    imgList.innerHTML = "";
    for (let i = 0; i < fileLists.length; i++) {
        let file = fileLists[i];
        createImageDiv(file, i);
    }
}

function clearImageDiv() {
    let imgList = document.querySelector("#div-upload-image");
    if (imgList.innerHTML !== "") {
        imgList.innerHTML = "";
    }
    fileLists = []
}

function deleteImage() {
    let i = document.querySelector('#p-delete-dialog').value;
    fileLists.splice(i, 1);
    console.log(i, fileLists)
    refreshUploadFiles();
}

function createImageDiv(file, i) {
    let src = URL.createObjectURL(file); 
    let imgDiv = document.createElement('div');
    imgDiv.style.border = '1px solid'
    imgDiv.style.margin = '5px';
    let imgList = document.querySelector("#div-upload-image");
    imgDiv.style.width = "100px";
    imgDiv.style.height = "100px";
    imgDiv.classList.add('d-inline-block');
    imgDiv.innerHTML = `<button id="img_delete_btn_${i}" type="button" class="btn-close" data-bs-toggle="modal" data-bs-target="#deleteImageDialog" aria-label="Close" style="position: absolute;" onclick="showDeleteImageDialog(${i});"></button>
    <img id="img_upload_target_${i}" style="width: 100%; height: 100%;" src="${src}" alt="${file.name}">`;
    imgList.appendChild(imgDiv);
}

function showDeleteImageDialog(i) {
    let uploadFiles = document.getElementById("uploadImgInput").files;
    //alert(`Delete Target : ${uploadFiles[i].name}`);
    let pDialog = document.querySelector("#p-delete-dialog");
    pDialog.innerHTML = `${i + 1}번째 사진을 삭제하시겠습니까?`
    pDialog.value = i;
}

function startUpload() {
    let btn = document.querySelector('#btn-img-upload');
    btn.disabled = true;
    btn.innerHTML = '';
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    업로드 진행중...`;
}

function Uploader(file) {
    var self = this;
    this._file = file;
    this._serverFileKey = "";        // 업로드 성공시 서버에서 전달된 고유 값을 저장(이 예제에서는 파일 이름이 사용됨)
    this._xhr = new XMLHttpRequest();
    this._xhr.addEventListener("load", transferComplete);
    this._xhr.upload.addEventListener("progress", updateProgress);
    this._xhr.upload.addEventListener("error", transferFailed);

    // uploadList에 업로드 아이템을 하나 추가한다.
    var li = document.createElement("li");
    var fileNameSpan = document.createElement("span");
    var blankSpan = document.createElement("span");
    var progressSpan = document.createElement("span");
    var cancelLink = document.createElement("a");
    fileNameSpan.innerHTML = file.name;
    blankSpan.innerHTML = " ";
    cancelLink.setAttribute("href","#");
    cancelLink.innerHTML = "[X]";
    li.appendChild(fileNameSpan);
    li.appendChild(blankSpan);
    li.appendChild(progressSpan);
    li.appendChild(cancelLink);
    var uploadList = document.getElementById("uploadImgInput");
    uploadList.appendChild(li);

    // 취소 버튼 클릭 이벤트
    cancelLink.onclick = function () {
        // 업로드 취소
        self._xhr.abort();
        // 업로드 파일 목록에서 제거
        self._removeUploadItem();
    };

    // 업로드를 시작시킨다.
    this.startUpload = function () {
        var reader = new FileReader();
        var fileName = this._file.name;
        var xhr = self._xhr;

        // FileReader에서 파일 데이터를 읽은 경우 발생하는 이벤트
        reader.onload = function(evt) {
            // AJAX 요청을 생성해 전송한다.
            xhr.open("POST", "upload.asp", true);
            // 파일 이름은 file-name에 명시한다.
            xhr.setRequestHeader("file-name", encodeURIComponent(fileName));
            xhr.send(evt.target.result);
        };

        // 비동기 파일 읽기 시작
        reader.readAsArrayBuffer(file);            
    }

    this._removeUploadItem = function () {
        uploadList.removeChild(li);
        uploadFileList.remove(self._serverFileKey);
    }

    // AJAX 데이터가 전송되는 동안 수시로 발생하는 이벤트로 진행 과정을 출력한다.
    function updateProgress(evt) {
        if (evt.lengthComputable) {
            var percentComplete = Math.ceil(evt.loaded / evt.total * 100);
            progressSpan.innerHTML = percentComplete + "%";
        }
    }

    // 한 파일 업로드가 완료되면 호출되는 이벤트로 성공시 고유 값(이 예제에서는 파일 이름)이 반환된다.
    function transferComplete() {
        if (this.status == 200) {
            progressSpan.innerHTML = "";
            self._serverFileKey = this.responseText;
            uploadFileList.add(self._serverFileKey);
        } else {
            alert("ERROR : " + this.responseText);
            self._removeUploadItem();
        }
    }

    function transferFailed(evt) {
        self._removeUploadItem();
        console.log("An error occurred while transferring the file.");
    }
}