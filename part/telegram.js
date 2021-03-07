const pool = require("../mysql")

const md5 = require("md5")

module.exports = {
  //新增訂閱
  add_sub: async function (telegram_id, sub_data, telegram_username) {
    //檢查telegram_id 是否存在沒有則新增至 account
    await check_acconut_exist(telegram_id, telegram_username)

    //計算當前訂閱數量是否達上限
    const sub_count = await telegram_sub_count(telegram_id)

    //   console.log(sub_count['COUNT(sub)'])
    if (sub_count["COUNT(sub)"] >= 10) return "max"

    //獲取帳戶資料
    const account_info = await get_acconut_info(telegram_id)

    //傳送訂閱資料
    const sub_result = await sub_send(sub_data, account_info.telegram_id, account_info.user_name)

    return sub_result
  },

  //獲取訂閱
  get_sub: function (telegram_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) throw err

        const sql = `SELECT sub FROM account_sub WHERE telegram_id = '${telegram_id}'`

        connection.query(sql, (err, rows) => {
          connection.release() // return the connection to pool

          if (!err) {
            resolve(rows)
          } else {
            resolve(false)
          }
        })
      })
    })
  },

  //刪除訂閱
  delete_sub: function (telegram_id, sub) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) throw err

        const sql = `DELETE FROM account_sub WHERE telegram_id = '${telegram_id}' AND sub = '${sub}'`

        connection.query(sql, (err, rows) => {
          connection.release() // return the connection to pool

          if (!err) {
            resolve(true)
          } else {
            console.log(err)
            resolve(false)
          }
        })
      })
    })
  },

  //綁定檢查
  bind_user_check: async function (telegram_id) {
    //檢查綁定狀態
    const get_acconut_info_result = await get_acconut_info(telegram_id)

    if (get_acconut_info_result != undefined) return get_acconut_info_result.user_name
    else return null
  },

  //綁定使用者
  bind_user: async function (telegram_id, bind_code, telegram_username) {
    //檢查綁定碼，bind_code_result 取得用戶名
    const bind_code_result = await check_bind_code(bind_code)
    if (!bind_code_result) return "綁定碼不存在，可能輸入錯誤"

    //檢查綁定狀態
    const check_acconut_bind_result = await check_acconut_bind(telegram_id)
    if (check_acconut_bind_result) return "你的TG已和其他帳號綁定"

    //綁定帳號與資料，傳入bind_code_result取得的用戶名
    const acconut_bind_result = await acconut_bind(telegram_id, bind_code_result, telegram_username)
    if (!acconut_bind_result) return "綁定失敗，請再試一次"

    //合併資料
    const merge_sub_data_input_result = await merge_sub_data_input(telegram_id)

    if (merge_sub_data_input_result) return "與『" + merge_sub_data_input_result + "』綁定帳號成功"
    else return "帳號合併失敗"
  },

  //解除綁定
  unbind_user: async function (telegram_id) {
    //檢查綁定
    const check_acconut_bind_result = await check_acconut_bind(telegram_id)
    if (!check_acconut_bind_result) return "你的Telegram並無綁定帳號"

    //解除綁定
    const acconut_bind_un_bild_result = await acconut_bind_un_bild(telegram_id)

    if (acconut_bind_un_bild_result) return "解除綁定成功"
  },

  //重置密碼

  re_pas: async function (telegram_id) {
    //新密碼
    const new_pas = generatePassword()

    const result = await change_pas(telegram_id, md5(new_pas))

    if (result) return new_pas
    else return result
  },
}

//檢查telegram_id是否存在沒有則新增至 account ，true
function check_acconut_exist(telegram_id, telegram_username) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err

      const sql =
        `insert into account  (telegram_id,telegram_username,user_name)Select '${telegram_id}','${telegram_username}',''` +
        `Where not exists(select 1 from account where telegram_id='${telegram_id}')`

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool

        if (!err) {
          resolve(true)
        } else {
          console.log(err)
          resolve(false)
        }
      })
    })
  })
}

//獲取帳戶資訊
function get_acconut_info(telegram_id) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      const sql = `SELECT * FROM  account WHERE telegram_id = '${telegram_id}'`

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool
        resolve(rows[0])

        if (err) console.log(err)
      })
    })
  })
}

//檢查telegram_id是否已經綁定，true(以綁)，false(未綁)
async function check_acconut_bind(telegram_id) {
  //檢查帳號存在，沒有就創建
  await check_acconut_exist(telegram_id)

  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      const sql = `SELECT * FROM  account WHERE telegram_id = '${telegram_id}'AND user_name = ''limit 1 `

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool

        if (rows[0] != null) resolve(false)
        else {
          console.log(err)
          resolve(true)
        }
      })
    })
  })
}

//telegram_id綁定

async function acconut_bind(telegram_id, user_name, telegram_username) {
  return new Promise((resolve, reject) => {
    //帳號寫入綁定的telegram_id，清除綁定碼

    pool.getConnection((err, connection) => {
      const sql = `UPDATE account SET telegram_id='${telegram_id}',bind_code='', telegram_username='${telegram_username}' WHERE user_name = '${user_name}'`

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool
        if (!err) resolve(true)
        else {
          console.log(err)
          resolve(false)
        }
      })
    })

    //刪除原本
    pool.getConnection((err, connection) => {
      const sql = `Delete FROM  account WHERE telegram_id = '${telegram_id}' AND user_name = '' limit 1 `

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool
        if (err) console.log(err)
      })
    })
  })
}

//解除綁定成功  true
async function acconut_bind_un_bild(telegram_id) {
  const acconut_info = await get_acconut_info(telegram_id)

  const user_name = acconut_info.user_name

  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      const sql =
        //刪除帳好連接
        `UPDATE account SET telegram_id='',bind_code='TG@${md5(user_name).substr(0, 5)}', telegram_username='' WHERE user_name = '${user_name}'` +
        //刪除tg訂閱
        `;UPDATE account_sub SET telegram_id=''WHERE telegram_id = '${telegram_id}'`

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool

        if (!err) {
          resolve(true)
        } else {
          console.log(err)
          resolve(false)
        }
      })
    })
  })
}

//檢查bind_code存在，存在回傳user_name
function check_bind_code(bind_code) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      const sql = `SELECT * FROM  account WHERE bind_code = '${bind_code}' limit 1`

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool

        if (rows[0] == null) resolve(false)
        else resolve(rows[0].user_name)

        if (err) console.log(err)
      })
    })
  })
}

//合併 - 訂閱資料輸入
async function merge_sub_data_input(telegram_id) {
  //獲取帳號
  const acconut_info = await get_acconut_info(telegram_id)

  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      let sql =
        //添加合併的帳號
        ` UPDATE account_sub SET user_name = '${acconut_info.user_name}' ,telegram_id = '${telegram_id}'  ` +
        `WHERE  telegram_id = '${telegram_id}' OR user_name =  '${acconut_info.user_name}'` +
        //刪除舊資料
        `;DELETE n1 FROM account_sub n1, account_sub n2` +
        ` WHERE n1.id > n2.id AND n1.telegram_id = n2.telegram_id AND n1.user_name = n2.user_name AND n1.sub = n2.sub` +
        //只保留十筆
        `;DELETE  FROM account_sub WHERE user_name = '${acconut_info.user_name}' AND id not in(select t.id from (SELECT * FROM account_sub where user_name =  '${acconut_info.user_name}' limit 10)as t)`

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool

        if (!err) {
          resolve(acconut_info.user_name)
        } else {
          console.log(err)
          resolve(false)
        }
      })
    })
  })
}

//訂閱
function sub_send(sub_data, telegram_id, user_name) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err

      let sql

      if (user_name == null)
        sql = `insert into account_sub(telegram_id, sub)Select '${telegram_id}', '${sub_data}'
            Where not exists(select * from account_sub where telegram_id = '${telegram_id}' AND  sub = '${sub_data}')`
      else
        sql = `insert into account_sub(user_name, telegram_id, sub)Select '${user_name}', '${telegram_id}', '${sub_data}'
            Where not exists(select * from account_sub where telegram_id = '${telegram_id}' AND  sub = '${sub_data}')`

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool

        if (!err) {
          resolve(true)
        } else {
          console.log(err)
          resolve(false)
        }
      })
    })
  })
}

//檢查訂閱上限

function telegram_sub_count(telegram_id) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      const sql = `SELECT COUNT(sub) FROM account_sub WHERE telegram_id  = '${telegram_id}'`

      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool

        if (!err) {
          resolve(rows[0])
        } else console.log(err)
      })
    })
  })
}

//修改綁定密碼

function change_pas(telegram_id, new_pas) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      const sql = `UPDATE account SET user_password='${new_pas}' WHERE telegram_id = '${telegram_id}'`

      console.log(sql)
      connection.query(sql, (err, rows) => {
        connection.release() // return the connection to pool

        if (!err) {
          resolve(true)
        } else {
          resolve(false)
          console.log(err)
        }
      })
    })
  })
}

//隨機密碼產生

function generatePassword() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = ""
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n))
  }
  return retVal
}
