/* express */
const express = require("express")
const bodyParser = require("body-parser")
const compression = require("compression")
const apicache = require("apicache")
const redis = require("redis")
const cacheWithRedis = apicache.options({
  //排除緩存頭
  headerBlacklist: ["access-control-allow-origin"],
  redisClient: redis.createClient(),
}).middleware

const app = express()

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listen on port ${port}`))
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)
app.use(bodyParser.json())
app.use(compression()) //壓縮
app.disable("x-powered-by") //關閉響應頭部
/* express */

/* 跨域設定 */
const cors = require("cors")
app.use(
  cors({
    origin: ["http://127.0.0.1:4500", "http://127.0.0.1:4000", "https://weather.ninull.com", "http://weather.ninull.com"],
    credentials: true, // enable set cookie
  })
)
/* 跨域設定 */

/* part */
const account = require("./part/account")
const user = require("./part/user")
const telegram = require("./part/telegram")
const other = require("./part/other")
/* part */

/* mysql  */
const pool = require("./mysql")

/* mysql  */

/* session */
const session = require("express-session")
const { promises } = require("fs")
const { constants } = require("buffer")
const MySQLStore = require("express-mysql-session")(session)
const sessionStore = new MySQLStore(
  {
    expiration: 10800000,
    createDatabaseTable: true, //是否創建表
    schema: {
      tableName: "account_session",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  },
  pool
)

//配置中間件

app.use(
  session({
    key: "aid",
    secret: "keyboard cat",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie:
      ("name",
      "value",
      {
        maxAge: 48 * 60 * 60 * 1000, //兩天過期
        secure: false,
        name: "seName",
        resave: false,
      }),
  })
)
/* session */

/* MySQL  創建資料表 */

//帳號資料表
other.creat_account_table_in_mysql()

//訂閱資料表
other.creat_account_sub_table_in_mysql()

/* MySQL  創建資料表 */

/*START */
/*START */
/*START */
/*START */

// 防止捕獲圖標
app.get("/favicon.ico", (req, res) => res.status(204))

//註冊
app.post("/account/register", async (req, res) => {
  const data = {
    user_name: req.body.user_name,
    user_passowrd: req.body.user_passowrd,
    telegram_id: "",
    telegram_username: "",
    bind_code: req.body.bind_code,
  }

  const result = await account.creat_account(data)

  res.send(result)
})

//登入

app.post("/account/login", async (req, res) => {
  const data = {
    user_name: req.body.user_name,
    user_passowrd: req.body.user_passowrd,
  }

  const result = await account.check_login(data)

  if (result) {
    req.session.userinfo = req.body.user_name

    res.send("login_success:" + req.session.userinfo)
  } else res.send(false)
})

//登出

app.delete("/account/login", (req, res) => {
  //註銷session
  req.session.destroy((err) => {
    if (!err) {
      res.send(true)
    } else {
      res.send(false)
    }
  })
})

/* session 驗證*/

app.use("/account/", (req, res, next) => {
  //  console.log(req.ip)

  if (req.session.userinfo) {
    next()
  } else {
    res.send("login_fail")
  }
})

//檢查登入

app.get("/account/login", (req, res) => {
  res.send("user_name:" + req.session.userinfo)
})

//修改密碼
app.post("/account/change_password", async (req, res) => {
  const data = {
    user_name: req.session.userinfo,
    user_passowrd_old: req.body.user_passowrd_old,
    user_passowrd_new: req.body.user_passowrd_new,
  }

  const result = await account.change_passowrd(data)

  if (result) {
    res.send(true)
  } else {
    res.send(false)
  }
})

//新增訂閱
app.put("/account/user/sub", async (req, res) => {
  const result = await user.add_sub(req.session.userinfo, req.body.sub_data)
  res.send(result)
})

//刪除訂閱
app.delete("/account/user/sub", async (req, res) => {
  const result = user.delete_sub(req.session.userinfo, req.body.sub)
  res.send(result)
})

//獲取訂閱
app.get("/account/user/sub", async (req, res) => {
  const result = await user.get_sub(req.session.userinfo)
  res.send(result)
})

//獲取telegram code
app.get("/account/telegram", async (req, res) => {
  const result = await account.get_telegram(req.session.userinfo)

  if (result) {
    if (result.telegram_username == "") res.send("bind_code:" + result.bind_code)
    else res.send("telegram_username:" + result.telegram_username)
  }
})

// 獲取天氣資料

app.get("/city/:city_name", cacheWithRedis("3 minutes"), async (req, res) => {
  const result = await other.get_weather([req.params.city_name])

  res.send(result)
})

/*  telegram */
/*  telegram */
/*  telegram */
/*  telegram */
/*  telegram */

/* 攔截非本地*/
app.use("/telegram/", (req, res, next) => {
  console.log(req.ip)

  if (req.ip != "::ffff:127.0.0.1") res.send("not allow")

  next()
})

/*  telegram  新增訂閱 */
app.put("/telegram/sub", async (req, res) => {
  const result = await telegram.add_sub(req.body.telegram_id, req.body.sub_data, req.body.telegram_username)

  res.send(result)
})

/*  telegram  刪除訂閱 */

app.delete("/telegram/sub", async (req, res) => {
  const result = await telegram.delete_sub(req.body.telegram_id, req.body.sub_data)

  res.send(result)
})

/*  telegram 獲取訂閱 */

app.get("/telegram/sub/:telegram_id", async (req, res) => {
  const result = await telegram.get_sub([req.params.telegram_id])

  res.send(result)
})

/*  telegram  檢查綁定狀態 */

app.get("/telegram/bind/:telegram_id", async (req, res) => {
  const result = await telegram.bind_user_check([req.params.telegram_id])

  res.send(result)
})

/*  telegram  綁定 */

app.post("/telegram/bind", async (req, res) => {
  const result = await telegram.bind_user(req.body.telegram_id, req.body.bind_code, req.body.telegram_username)

  res.send(result)
})

/*  telegram  解除綁定 */

app.delete("/telegram/bind", async (req, res) => {
  const result = await telegram.unbind_user(req.body.telegram_id)

  res.send(result)
})

/*  telegram  修改綁定用戶密碼 */

app.post("/telegram/bind_user_re_pas", async (req, res) => {
  const result = await telegram.re_pas(req.body.telegram_id)

  res.send(result)
})
