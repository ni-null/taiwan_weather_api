const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const cors = require('cors')
app.use(cors({
    origin: ['http://127.0.0.1:4500', 'http://127.0.0.1:4000', 'https://weather.ninull.com', 'http://weather.ninull.com'],
    credentials: true // enable set cookie
}));

const rootPath = path.normalize(__dirname) + '/app.sock'

console.log(rootPath)

const con_mysql_info = require("./json/con_mysql_info.json");


const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())


// part


const register = require('./part/register')
const login = require('./part/login')
const user = require('./part/user')


const pool = mysql.createPool(con_mysql_info)

// part 

// session

const session = require('express-session');
const { promises } = require('fs')
const MySQLStore = require('express-mysql-session')(session);


const sessionStore = new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,	//是否創建表
    schema: {
        tableName: 'session_tab',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, pool);



//配置中間件
app.use(session({
    key: 'aid',
    secret: "keyboard cat",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: ('name', 'value', {
        maxAge: 60 * 60 * 1000,
        secure: false,
        name: "seName",
        resave: false
    })
}));

//

// MySQL 連接

// Get all beers

/* app.use('/login/:user_name', function (req, res) {

   
    if (req.session.userinfo) {
        res.send("hello " + req.session.userinfo + "，welcome to index");
    } else {

        req.session.userinfo = [req.params.user_name];
        res.send("登陸成功！" + req.session.userinfo);
    }
});
 */

//創建帳號資料表
creat_account_table_in_mysql()

//創建訂閱資料表
creat_account_sub_table_in_mysql()

//註冊

app.post('/account/register', (req, res) => {

    const user_name = req.body.user_name
    const user_passowrd = req.body.user_passowrd
    const data = {
        user_name: user_name,
        user_passowrd: user_passowrd
    }



    register.creat_account(data).then(reslut =>
        res.send(reslut)
    );


})

//登入

app.post('/account/login', (req, res) => {

    console.log(req.socket.remoteAddress)
    const user_name = req.body.user_name
    const user_passowrd = req.body.user_passowrd
    const data = {
        user_name: user_name,
        user_passowrd: user_passowrd
    }

    login.check(data).then(reslut => {
        //判斷登入帳號密碼後再寫session
        //判斷登入帳號密碼後再寫session
        //判斷登入帳號密碼後再寫session
        if (reslut == 'success') {
            req.session.userinfo = user_name;
            res.send("success" + req.session.userinfo);
        }

        else res.send("login_fail");

    }

    );

})


//登出

app.delete('/account/login', function (req, res) {

    //註銷session
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            console.log("刪除" + req.session.userinfo)
        } else {
            res.send("刪除成功");

        }
    });
});

//檢查登入

app.post('/account/login_check', (req, res) => {

    if (req.session.userinfo) {
        res.send("user_name:" + req.session.userinfo);
    } else {
        res.send('error');
    }


})


//新增訂閱
app.put('/account/user/sub', (req, res) => {

    if (req.session.userinfo) {

        const sub_data = req.body.sub_data

        user.add_sub(req.session.userinfo, sub_data).then(reslut =>
            res.send(reslut)
        );

    } else {
        res.send('login_fail');
    }


})
//刪除訂閱
app.delete('/account/user/sub', (req, res) => {
    if (req.session.userinfo) {

        console.log(req.body.sub)
        console.log(req.body)
        const sub = req.body.sub

        console.log(req.session.userinfo + "刪除訂閱" + req.body.sub)
        user.delete_sub(req.session.userinfo, sub).then(reslut =>
            res.send(reslut)
        );



    } else {
        res.send('login_fail');
    }

})

//獲取訂閱
app.get('/account/user/sub', (req, res) => {

    if (req.session.userinfo) {

        console.log(req.session.userinfo + "獲取訂閱")
        user.get_sub(req.session.userinfo).then(reslut =>
            res.send(reslut)
        );



    } else {
        res.send('login_fail');
    }

})

// 防止捕獲圖標
app.get('/favicon.ico', (req, res) => res.status(204));

// 獲取資料

app.get('/city/:city_name', (req, res) => {


    pool.getConnection((err, connection) => {
        if (err) throw err

        connection.query('SELECT * from ' + [req.params.city_name], (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

        })
    })
})




function creat_account_table_in_mysql() {


    pool.getConnection((err, connection) => {
        if (err) throw err

        const sql = `create table if not exists account(
            id int primary key auto_increment,
            user_name varchar(255)not null,
            user_passowrd varchar(255)not null
        )`
        connection.query(sql, (err, rows) => {
            connection.release() // return the connection to pool

            if (err) {
                console.log(err)

            }
        })
    })



}



function creat_account_sub_table_in_mysql() {


    pool.getConnection((err, connection) => {
        if (err) throw err

        const sql = `create table if not exists account_sub(
            id int primary key auto_increment,
            user_name varchar(255)not null,
            sub varchar(255)not null
        )`
        connection.query(sql, (err, rows) => {
            connection.release() // return the connection to pool

            if (err) {
                console.log(err)

            }
        })
    })



}



// Listen on enviroment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`))

