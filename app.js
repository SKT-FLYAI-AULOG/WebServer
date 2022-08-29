const { upload } = require("./upload");
const mysql = require('./mysql');

const fs = require('fs');
const reques = require('request');
const axios = require('axios');
const https = require('https');
const FormData = require("form-data");
const express = require('express');
const { MemoryStore } = require("express-session");
const session = require('express-session');
const app = express()

const maxAge = 1000 * 60 * 60;

if (mysql.connect()){
    console.log('mysql Connected.');
}

app.listen(1549, () => {

});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'aulog',
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({checkPeriod: maxAge}),
    cookie: {
        maxAge: maxAge
    }
}));

app.get('/', (req, res) => {
    if (req.session?.login) {
        res.render('index', {});
    }
    else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    if (req.session?.login) {
        res.redirect('/');
    }
    else{
        res.render('loginPage', {msg: null});
    }
});

app.get('/register', (req, res) => {
    if (req.session?.login) {
        res.redirect('/');
    }
    else{
        res.render('registerPage', {});
    }
});

app.get('/post', (req, res) => {
    res.render('postPage', {});
});


// 이미지 업로드
app.post("/upload", upload.array("files"), async (req, res) => {
    let results = [];
    let formData = FormData();
    req.files.map(data => {
        // console.log("폼에 정의된 필드명 : ", data.fieldname);
        // console.log("사용자가 업로드한 파일 명 : ", data.originalname);
        // console.log("파일의 엔코딩 타입 : ", data.encoding);
        // console.log("파일의 Mime 타입 : ", data.mimetype);
        // console.log("파일이 저장된 폴더 : ", data.destination);
        // console.log("destinatin에 저장된 파일 명 : ", data.filename);
        // console.log("업로드된 파일의 전체 경로 ", data.path);
        // console.log("파일의 바이트(byte 사이즈)", data.size);
        
        // 파일
        results.push({});
        results[results.length - 1].filename = data.filename;
        formData.append('files', fs.createReadStream(data.path), { knownLength: fs.statSync(data.path).size });
    })
    axios.post(`http://192.168.10.83:5000/clf`, formData, {
        ...formData.getHeaders(),
        "Content-Length": formData.getLengthSync()
    }).then(data => {
        let result = data.data.split(";");
        let split;
        for(let i = 0; i < result.length - 1; i++) {
            split = result[i].split(",");
            results[i].tag = split[0];
        }
        console.log(results);
        res.json({ok: true, data: results});
    }).catch((err) => {
        console.log(err.toString());
        req.files.map(data => {
            fs.unlink(data.path, (err) => {
                if (err)
                    console.log(err);
            });
        });
        res.json({ok: false, data: []});
    });
});

app.post('/idcheck', (req, res) => {
    let id = req.body.id;
    mysql.query(`SELECT * FROM userAccount WHERE id='${id}';`, function(err, results, fields) {
        if (results.length > 0) {
            res.json({ok: false});
        }
        else {
            res.json({ok: true});
        }
    });
});

app.post('/nickcheck', (req, res) => {
    let nick = req.body.nick;
    mysql.query(`SELECT * FROM userAccount WHERE nick='${nick}';`, function(err, results, fields) {
        if (results.length > 0) {
            res.json({ok: false});
        }
        else {
            res.json({ok: true});
        }
    });
});

app.post('/register', (req, res) => {
    let id = req.body.id;
    let pw = req.body.pw;
    let email = req.body.email;
    let nick = req.body.nick;
    console.log("POST Register!", id, pw, email, nick);
    mysql.query(`SELECT * FROM userAccount WHERE id='${id}' OR nick='${nick}';`, function(err, results, fields) {
        if (results.length === 0) {
            results = mysql.query(`INSERT INTO userAccount(id, pw, email, nick) VALUE('${id}', '${pw}', '${email}', '${nick}');`, function(err, results, fields) {
                if (!err) {
                    res.json({ok: true, msg: "가입에 성공했습니다."});
                }
                else {
                    res.json({ok: false, msg: "가입 도중 오류가 발생했습니다."});
                }
            });
        }
        else {
            res.json({ok: false, msg: "가입에 실패했습니다."});
        }
    });
});

app.post('/login', (req, res) => {
    let id = req.body.id;
    let pw = req.body.pw;
    mysql.query(`SELECT * FROM userAccount WHERE id='${id}' AND pw='${pw}';`, function(err, results, fields) {
        if (!err) {
            if (results.length === 1) {
                req.session.login = true;
                req.session.nick = results[0]['nick'];
                res.redirect('/');
            }
            else {
                res.render('loginPage', {ok: false, msg: "아이디와 비밀번호를 확인해주세요."});
            }
        }
        else {
            res.render('loginPage', {ok: false, msg: "로그인 도중 오류가 발생했습니다."});
        }
    });
});