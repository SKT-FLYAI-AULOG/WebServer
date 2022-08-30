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

const API_URL = "http://localhost:1549";

const maxAge = 1000 * 60 * 60;

if (mysql.connect()){
    console.log('mysql Connected.');
}

app.listen(80, () => {

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
app.post("/upload/*", upload.array("files"), async (req, res) => {
    console.log("PARAM", req.params);
    let results = [];
    let formData = FormData();
    let url = req.params[0] == 'class' ? API_URL+`/clf` : API_URL+`/predict`;
    let type = req.params[0] == 'class' ? "files" : "file"
    try {
        req.files.map(data => {
            // console.log("폼에 정의된 필드명 : ", data.fieldname);
            // console.log("사용자가 업로드한 파일 명 : ", data.originalname);
            // console.log("파일의 엔코딩 타입 : ", data.encoding);
            // console.log("파일의 Mime 타입 : ", data.mimetype);
            // console.log("파일이 저장된 폴더 : ", data.destination);
            // console.log("destinatin에 저장된 파일 명 : ", data.filename);
            // console.log("업로드된 파일의 전체 경로 ", data.path);
            // console.log("파일의 바이트(byte 사이즈)", data.size);
            console.log(data);
            
            // 파일
            results.push({});
            results[results.length - 1].filename = data.filename;
            formData.append(type, fs.createReadStream(data.path), { knownLength: fs.statSync(data.path).size });
        })
        axios.post(url, formData, {
            ...formData.getHeaders(),
            "Content-Length": formData.getLengthSync(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }).then(data => {
            console.log(data);
            if (req.params[0] == 'class') {
                let result = data.data.split(";");
                let split;
                for(let i = 0; i < result.length - 1; i++) {
                    split = result[i].split(",");
                    results[i].tag = split[0];
                }
                console.log(results);
                res.json({ok: true, data: results});
            }
            else {
                for(let i = 0; i < results.length; i++) {
                    results[i].tag = data.data.mainObj;
                }
                results.tags = data.data.allObj;
                console.log(results)
                res.json({ok: true, data: results});
            }
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
    }
    catch(e) {
        console.log(e.toString());
    }
    
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
                req.session.no = results[0]['no'];
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

app.post('/submitPost', (req, res) => {
    let data = req.body;
    console.log(data);

    if (req.session.login) {
        mysql.query(`INSERT INTO userpost(class, title, text, open, user_no, date) VALUE('${data.class}', '${data.title}', '${data.post}', '${data.open ? 1 : 0}', '${req.session.no}', '${new Date(Date.now())}');`, function(err, results, fields) {
            if (!err) {
                let postNo = results.insertId;
                // 사진
                let success = 0;
                for(let i = 0; i < data.images.length; i++) {
                    mysql.query(`INSERT INTO postimg(post_no, url) VALUE('${postNo}', '${"assets/uploads/" + data.images[i]}');`, function(err, results, fields) {
                        if (!err) {
                            success += 1;
                            if (success == data.images.length) {
                                success = 0;
                                // 태그
                                for(let i = 0; i < data.tags.length; i++) {
                                    mysql.query(`INSERT INTO tags(post_no, tag) VALUE('${postNo}', '${data.tags[i]}');`, function(err, results, fields) {
                                        if (!err) {
                                            success += 1;
                                            if (success == data.images.length) {
                                                res.json({ok: true});
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
                
            }
            else {
                console.log(err.toString());
                res.json({ok: false});
            }
        });
    }
    
});


app.post("/loadPosts", (req, res) => {
    if (req.session.login) {
        let userNo = req.session.no;
        let page = req.body.page;
        let num = 5;
        let start = (page - 1) * num;
        let data = {};
        let success = 0;
        mysql.query(`SELECT * FROM userpost WHERE user_no='${userNo}' ORDER BY no DESC;`, function(err, results, fields) {
            if (!err) {
                let forLimit = Math.min(start + 5, results.length);
                for(let i = start; i < forLimit; i++) {
                    let postNo = results[i]['no'];
                    if (!data[postNo]) {
                        data[postNo] = {};
                    }
                    data[postNo].postNo = postNo;
                    data[postNo].date = results[i]['date'];
                    data[postNo].title = results[i]['title'];
                    data[postNo].text = results[i]['text'];
                    if (data[postNo].text.length > 50) {
                        data[postNo].text = data[postNo].text.slice(0, 50) + "...";
                    }

                    mysql.query(`SELECT * FROM postimg WHERE post_no='${postNo}' ORDER BY rand() limit 1;`, function(err, results, fields) {
                        if (!err) {
                            data[results[0]['post_no']].img = results[0]['url'];
                            data[results[0]['post_no']].tags = [];
                            console.log(results[0]['post_no']);
                            mysql.query(`SELECT * FROM tags WHERE post_no='${results[0]['post_no']}' ORDER BY rand() limit 3;`, function(err, results, fields) {
                                if (!err) {
                                    if (results.length > 0) {
                                        for(let j = 0; j < results.length; j++) {
                                            data[results[0]['post_no']].tags.push(results[j]['tag'])
                                        }
                                    }
                                    success += 1;
                                    console.log(forLimit - start, success);
                                    if (success === forLimit - start) {
                                        res.json(data);
                                    }
                                }
                                else {
                                    console.log(err.toString());
                                }
                            });
                        }
                        else {
                            console.log(err.toString());
                        }
                    });
                }
            }
            else {
                console.log(err.toString());
            }
        });
    }
});


app.post('/recommend', (req, res) => {
    if (req.session.login) {
        let type = req.body.type;
        let word = req.body.word;
        console.log(req.body);
        let url = API_URL + '/recommend';
        let formData = FormData();
        formData.append('class', type);
        formData.append('inputtext', word);
        try {
            axios.post(url, formData, {
                ...formData.getHeaders(),
                "Content-Length": formData.getLengthSync(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }).then(data => {
                let sentence = data.data.split(",");
                console.log(sentence);
                res.send({ok: true, sentences: sentence});
            }).catch((err) => {
                console.log(err);
                res.json({ok: false})
            });
        }
        catch(e) {
            console.log(e.toStirng());

        }
    }    
});