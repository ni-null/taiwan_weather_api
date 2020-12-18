/* express */
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const apicache = require('apicache')
const redis = require("redis");
const cacheWithRedis = apicache.options({ redisClient: redis.createClient() }).middleware


const app = express()

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listen on port ${port}`))
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(compression()) //壓縮
/* express */


/* 跨域設定 */
const cors = require('cors')
app.use(cors({
    origin: [
        'http://127.0.0.1:4500',
        'http://127.0.0.1:4000',
        'https://weather.ninull.com',
        'http://weather.ninull.com']
    ,
    credentials: true // enable set cookie
}));
/* 跨域設定 */



/* part */
const register = require('./part/register')
const login = require('./part/login')
const user = require('./part/user')
const telegtam = require('./part/telegtam')
const other = require('./part/other')
/* part */

/* mysql  */
const pool = require('./mysql');

/* mysql  */


/* session */
const session = require('express-session');
const { promises } = require('fs')
const { constants } = require('buffer')
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,	//是否創建表
    schema: {
        tableName: 'account_session',
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
        maxAge: 2 * 60 * 60 * 1000,
        secure: false,
        name: "seName",
        resave: false
    })
}));
/* session */



/* MySQL  創建資料表 */


//帳號資料表
creat_account_table_in_mysql()

//訂閱資料表
creat_account_sub_table_in_mysql()


/* MySQL  創建資料表 */



/*START */
/*START */
/*START */
/*START */

// 防止捕獲圖標
app.get('/favicon.ico', (req, res) => res.status(204));

//註冊
app.post('/account/register', async (req, res) => {


    const data = {
        user_name: req.body.user_name,
        user_passowrd: req.body.user_passowrd,
        bind_code: req.body.bind_code
    }

    const reslut = await register.creat_account(data)

    res.send(reslut)



})

//登入

app.post('/account/login', async (req, res) => {


    const data = {
        user_name: req.body.user_name,
        user_passowrd: req.body.user_passowrd
    }

    const reslut = await login.check(data)

    if (reslut == 'success') {
        req.session.userinfo = req.body.user_name;
        res.send("login_success:" + req.session.userinfo)
    }

    else res.send(false)

}

)




//登出

app.delete('/account/login', function (req, res) {

    //註銷session
    req.session.destroy(function (err) {
        if (!err) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
});

//檢查登入

app.get('/account/login', (req, res) => {

    if (req.session.userinfo) {
        res.send("user_name:" + req.session.userinfo);
    } else {
        res.send(false);
    }


})


//新增訂閱
app.put('/account/user/sub', async (req, res) => {

    if (req.session.userinfo) {

        const reslut = await user.add_sub(req.session.userinfo, req.body.sub_data)
        res.send(reslut)

    } else {
        res.send('login_fail');
    }


})

//刪除訂閱
app.delete('/account/user/sub', async (req, res) => {
    if (req.session.userinfo) {

        const reslut = user.delete_sub(req.session.userinfo, req.body.sub)
        res.send(reslut)

    } else {
        res.send('login_fail');
    }

})

//獲取訂閱
app.get('/account/user/sub', async (req, res) => {

    if (req.session.userinfo) {

        const reslut = await user.get_sub(req.session.userinfo)
        res.send(reslut)

    } else {
        res.send('login_fail');
    }

})



// 獲取資料

app.get('/city/:city_name', cacheWithRedis('3 minutes'), async (req, res) => {


    const result = await other.get_wather([req.params.city_name])

    res.send(result)

})




/*  telegtam */
/*  telegtam */
/*  telegtam */
/*  telegtam */
/*  telegtam */


/*  telegtam  新增訂閱 */
app.put('/telegtam/sub', async (req, res) => {


    const reslut = telegtam.add_sub(req.body.telegram_id, req.body.sub_data)

    res.send(reslut)


})

/*  telegtam  刪除訂閱 */

app.delete('/telegtam/sub', async (req, res) => {

    const reslut = await telegtam.delete_sub(req.body.telegram_id, req.body.sub_data)

    res.send(reslut)

})


/*  telegtam 獲取訂閱 */

app.get('/telegtam/sub/:telegram_id', async (req, res) => {


    const reslut = await telegtam.get_sub([req.params.telegram_id])

    res.send(reslut)

})

/*  telegtam  綁定 */

app.post('/telegtam/bind', async (req, res) => {

    const reslut = await telegtam.bind_user(req.body.telegram_id, req.body.bind_code)

    res.send(reslut)

})


/*  telegtam  解除綁定 */

app.delete('/telegtam/bind', async (req, res) => {

    const reslut = await telegtam.unbind_user(req.body.telegram_id)

    res.send(reslut)

})







function creat_account_table_in_mysql() {


    pool.getConnection((err, connection) => {
        if (err) throw err

        const sql = `create table if not exists account(
            id int primary key auto_increment,
            user_name varchar(128) not null,
            user_passowrd varchar(128) not null,
            telegram_id varchar(128)not null ,
            bind_code  varchar(128) not null
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
            user_name varchar(255)not null ,
            telegram_id varchar(255) not null ,
            sub varchar(255) not null
        )`
        connection.query(sql, (err, rows) => {
            connection.release() // return the connection to pool

            if (err) {
                console.log(err)

            }
        })
    })



}


