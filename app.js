const express = require('express');
const app = express()

app.listen(1549, () => {

});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.render('index', {});
});