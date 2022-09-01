function loadPost(no) {
    $.ajax({
        url: '/loadPost',
        type: "post",
        data: JSON.stringify({
            no: no,
        }),
        cache: false,
        processData: false,
        contentType: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: (data) => {
            if (data.ok) {
                result = data.data[no];
                let profileImg = document.querySelector("#profile-img");
                profileImg.src = "/assets/uploads/null";

                let profile = document.querySelector("#div-post-profile");
                profile.innerHTML = `<p class="h6">#${result.tag}</p>
                <p class="h3">${result.name}</p>`;

                let title = document.querySelector("#post-title");
                title.innerHTML = result.title;

                let scrollImgs = document.querySelector("#div-img-scoll");
                scrollImgs.innerHTML = "";

                let active = 'active';
                for(let i = 0; i < result.imgs.length; i++) {
                    scrollImgs.innerHTML += `<div class="carousel-item justify-content-center ${active}">
                    <img src="/${result.imgs[i]}" class="d-block"></img>
                  </div>
                    `;
                    active = '';
                }

                let content = document.querySelector("#post-content");
                content.innerHTML = result.text;

                let tags = document.querySelector("#div-tags");
                tags.innerHTML = "";
                for(let i = 0; i < result.tags.length; i++) {
                    tags.innerHTML += `<label class="border border-secondary rounded bg-light" style="padding-left: 3px; padding-right: 3px; margin: 3px;">#${result.tags[i]}</label>`;
                }
            }
            else {
                
            }
        },
        error: (e) => {

        }
    });
}