$(document).ready(() => {
    let headerHTML = `<nav class="navbar navbar-expand-lg navbar-light bg-light" style="z-index: 100;">
    <div class="container-fluid">
      <button class="navbar-toggler bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand col-md-3" style="float: none; margin:0 auto; padding-right: 54px;" href="/">AULOG</a>
      <div class="collapse navbar-collapse bg-light bg-gradent" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">마이페이지</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              기록실
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><a class="dropdown-item" href="#">랭킹</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;

  let header = document.querySelector("header")
  header.innerHTML = headerHTML;
});