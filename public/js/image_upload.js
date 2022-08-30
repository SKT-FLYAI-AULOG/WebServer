let fileLists = [];
let fileInfos = [];

function uploadFileAdded() {
    clearImageDiv();
    let uploadFiles = document.getElementById("uploadImgInput")
    fileLists = Array.from(uploadFiles.files)
    for (let i = 0; i < fileLists.length; i++) {
        let file = fileLists[i];
        createImageDiv(file, i);
    }
    extImageInformation();
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
    imgDiv.style.marginBottom = '30px';
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
    if (fileLists.length === 0)
        return;
    let btn = document.querySelector('#btn-img-upload');
    btn.disabled = true;
    btn.innerHTML = '';
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    업로드 진행중...`;
    // 비동기 파일 업로드를 시작한다.
    let formData = new FormData();
    for (let i = 0; i < fileLists.length; i++) {
        formData.append('files', fileLists[i]);
        //var uploader = new Uploader(fileLists[i]);
        //uploader.startUpload();
    }
    let classIdx = document.querySelector("#btnradio1").checked ? 0 : 1;
    let url = classIdx == 0 ? "/upload/class" : "/upload/detect";
    console.log(url);
    $.ajax({
        url: url,
        type: "post",
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        success: (data) => {
            if (data.ok) {
                let imgList = document.querySelector("#div-upload-image").children;
                for(let i = 0; i < data.data.length; i++) {
                    imgList[i].innerHTML += `<p style="position: absolute; margin-top: 5px;">#${data.data[i].tag}</p>`;
                    fileInfos[i].filename = data.data[i].filename;
                    fileInfos[i].tag = data.data[i].tag;
                    if (fileInfos[i].info)
                        document.querySelector("#postTextAreaReadOnly").value += `${fileInfos[i].info.originalDate.getHours()}시 ${fileInfos[i].info.originalDate.getMinutes()}분에 ${data.data[i].tag}
`; 
                };
                document.querySelector("#postTextArea").value = document.querySelector("#postTextAreaReadOnly").value;
                document.querySelector('#p-upload-dialog').innerHTML = '업로드에 성공했습니다.';
                $('#successUploadDialog').modal('show');
                //fileLists = [];
                //refreshUploadFiles();
                btn.disabled = false;
                btn.innerHTML = '업로드';
            }
            else {
                document.querySelector('#p-upload-dialog').innerHTML = '업로드에 실패했습니다. 다시 시도해주세요.';
                $('#successUploadDialog').modal('show');
                btn.disabled = false;
                btn.innerHTML = '업로드';
            }
        },
        error: (e) => {
            document.querySelector('#p-upload-dialog').innerHTML = '업로드에 실패했습니다. 다시 시도해주세요.';
            $('#successUploadDialog').modal('show');
            btn.disabled = false;
            btn.innerHTML = '업로드';
        }
    });
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
            xhr.open("POST", "upload", true);
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

function extImageInformation() {
    let minDate = new Date(Date.now());
    for(let i = 0; i < fileLists.length; i++) {
        let file = fileLists[i];
        fileInfos.push({});
        EXIF.getData(file, function() {
            if(EXIF.pretty(this)) {
                let info = { 
                    make: EXIF.getTag(this, "Make"),
                    model: EXIF.getTag(this, "Model"),
                    uniqueID: EXIF.getTag(this, "ImageUniqueID"),
                    ssv: EXIF.getTag(this, "ShutterSpeedValue"),
                    software: EXIF.getTag(this, "Software"),
                    width: EXIF.getTag(this, "ImageWidth"),
                    height: EXIF.getTag(this, "ImageHeight"),
                    originalDate: EXIF.getTag(this, "DateTimeOriginal"),
                    digitizedDate: EXIF.getTag(this, "DateTimeDigitized"),
                    lastEditDate: EXIF.getTag(this, "DateTime"),
                    gpsLat: EXIF.getTag(this, "GPSLongitude"),
                    gpsLatRef: EXIF.getTag(this, "GPSLongitudeRef"),
                    gpsLong: EXIF.getTag(this, "GPSLatitude"),
                    gpsLongRef: EXIF.getTag(this, "GPSLatitudeRef")
                };
                // alert(`${info.make}, ${info.model}, ${info.uniqueID}, ${info.ssv}, ${info.software}, ${info.width}, ${info.height}, ${info.originalDate}, ${info.digitizedDate}, ${info.lastEditDate}, ${info.gpsLat}, ${info.gpsLong}`);
                let split = info.originalDate.split(" ");
                let convertTime = split[0].replaceAll(':', '-') + ' ' + split[1];
                let date = new Date(convertTime);
                info.originalDate = date;
                fileInfos[i].info = info;
                if (date < minDate) {
                    minDate = date;
                    let title = document.querySelector("#post-title");
                    title.value = `${minDate.getFullYear()}년 ${minDate.getMonth() + 1}월 ${minDate.getDate()}일`;
                }
            }
        });
    }

    
}


function editPost() {
    let postTextArea = document.querySelector("#postTextArea");
    let postTextAreaReadOnly = document.querySelector("#postTextAreaReadOnly");

    postTextAreaReadOnly.value = postTextArea.value;
}

function submitPost() {
    let classIdx = document.querySelector("#btnradio1").checked ? 0 : 1;
    let images = [];
    let tags = [];
    for(let i = 0; i < fileInfos.length; i++) {
        images.push(fileInfos[i].filename);
        tags.push(fileInfos[i].tag);
    }
    let title = document.querySelector("#post-title").value;
    let post = document.querySelector("#postTextAreaReadOnly").value;
    let open = document.querySelector("#openPostSwitch").checked;

    let btn = document.querySelector('#btn-post-submit');
    btn.disabled = true;
    btn.innerHTML = '';
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    글 등록 진행중...`;

    let postData = {
        class: classIdx,
        images: images,
        tags: tags,
        title: title,
        post: post,
        open: open,
    };
    $.ajax({
        url: "/submitPost",
        type: "post",
        data: JSON.stringify(postData),
        cache: false,
        processData: false,
        contentType: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: (data) => {
            if (data.ok) {
                document.querySelector("#postTextArea").innerHTML = document.querySelector("#postTextAreaReadOnly").innerHTML;
                document.querySelector('#p-upload-dialog').innerHTML = '글 등록에 성공했습니다.';
                $('#successUploadDialog').modal('show');
                //fileLists = [];
                //refreshUploadFiles();
                btn.disabled = false;
                btn.innerHTML = '글 등록하기';
            }
            else {
                document.querySelector('#p-upload-dialog').innerHTML = '글 등록에 실패했습니다. 다시 시도해주세요.';
                $('#successUploadDialog').modal('show');
                btn.disabled = false;
                btn.innerHTML = '글 등록하기';
            }
        },
        error: (e) => {
            document.querySelector('#p-upload-dialog').innerHTML = '글 등록에 실패했습니다. 다시 시도해주세요.';
            $('#successUploadDialog').modal('show');
            btn.disabled = false;
            btn.innerHTML = '글 등록하기';
        }
    });
    
}

function loadSentence() {
    let type = 'fish';
    let word = document.querySelector("#inp-recommand-word").value;
    $.ajax({
        url: "/recommend",
        type: "post",
        data: JSON.stringify({
            type: type,
            word: word,
        }),
        cache: false,
        processData: false,
        contentType: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: (data) => {
            if (data.ok) {
                let div = document.querySelector("#div-recommand-sentences");
                div.innerHTML = "";
                console.log()
                for(let i = 0; i < data.sentences.length; i++) {
                    div.innerHTML += `<button type="button" class="list-group-item list-group-item-action" onclick="addRecommandSentence(this);">${data.sentences[i]}</button>`
                }
            }
            else {
            }
        },
        error: (e) => {
            document.querySelector('#p-upload-dialog').innerHTML = '문장 추천 중 오류가 발생했습니다. 다시 시도해주세요.';
            $('#successUploadDialog').modal('show');
        }
    });
}

function addRecommandSentence(element) {

}