$(document).ready(() => {
    loadMyPost();
});

// 자신의 포스트 5개씩 가져옴
function loadMyPost(page=1) {
    let getData = {
        page: page,
    }
    $.ajax({
        url: "/loadPosts",
        type: "POST",
        data: JSON.stringify(getData),
        cache: false,
        processData: false,
        contentType: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: (data) => {
            console.log(data);
            const keysSorted = Object.keys(data).sort(function(a,b){return b-a})
            for(let i = 0; i < keysSorted.length; i++) {
                addPosts(data[keysSorted[i]]);
            }
        },
        error: (e) => {
            console.log("ERROR", e);
        }
    });
}

function addPosts(data) {
    let myPosts = document.querySelector("#div-my-posts");
    if (myPosts.getElementsByTagName('div').length < 1) {
        myPosts.innerHTML = "";
    }

    let mainDiv = document.createElement('div');
    mainDiv.classList.add('card');
    mainDiv.classList.add('col-md-3');
    mainDiv.style.float = 'none';
    mainDiv.style.margin = '0 auto';
    mainDiv.style.width = '30rem';

    let html = `<img src="${data.img}" class="card-img-top" style="position: relative;" alt="#">
                <div class="btn-group" role="group" aria-label="Basic outlined example">`
    for(let i = 0; i < data.tags.length; i++) {
        html += `<button type="button" class="btn btn-outline-primary">#${data.tags[i]}</button>`;
    }
    html += `</div>
            <div class="card-body">
                <h5 class="card-title">${data.title}</h5>
                <p class="card-text">${data.text}</p>
                <a href="#" class="btn btn-primary" onclick="location.href = 'post/${data.postNo}';">자세히 보기</a>
            </div>`;
    mainDiv.innerHTML = html;
    myPosts.appendChild(mainDiv);
}