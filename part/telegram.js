
const pool = require('../mysql');


const md5 = require('md5');


module.exports = {



    add_sub: async function (telegtam_id, sub_data, telegram_username) {


        //檢查telegtam_id是否存在沒有則新增至 account
        const check_result = await check_acconut_exist(telegtam_id, telegram_username)


        //獲取帳戶資料
        const account_info = await get_acconut_info(telegtam_id)

        //傳送訂閱資料
        const sub_result = await sub_send(sub_data, account_info.telegram_id, account_info.user_name)


        return sub_result


    }

    ,

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

        }

        )

    }
    ,
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

        }

        )

    }

    ,
    bind_user_check: async function (telegram_id) {


        //檢查綁定狀態
        const get_acconut_info_result = await get_acconut_info(telegram_id)


        if (get_acconut_info_result != undefined) return get_acconut_info_result.user_name

        else return null


    }
    ,
    bind_user: async function (telegram_id, bind_code, telegram_username) {

        //檢查綁定碼，bind_code_result 取得用戶名
        const bind_code_result = await check_bind_code(bind_code)
        if (!bind_code_result) return '綁定碼不存在，可能輸入錯誤'


        //檢查綁定狀態
        const check_acconut_bind_result = await check_acconut_bind(telegram_id)
        if (check_acconut_bind_result) return '你的TG已和其他帳號綁定'


        //綁定帳號與資料，傳入bind_code_result取得的用戶名
        const acconut_bind_result = await acconut_bind(telegram_id, bind_code_result, telegram_username)
        if (!acconut_bind_result) return '綁定失敗，請再試一次'


        //合併資料
        const merge_sub_data_input_result = await merge_sub_data_input(telegram_id)

        if (merge_sub_data_input_result)
            return '與『' + merge_sub_data_input_result + '』綁定帳號成功'

        else return '帳號合併失敗'

    }
    ,
    unbind_user: async function (telegram_id) {


        //檢查綁定
        const check_acconut_bind_result = await check_acconut_bind(telegram_id)
        if (!check_acconut_bind_result) return '你的Telegram並無綁定帳號'


        //解除綁定
        const acconut_bind_un_bild_result = await acconut_bind_un_bild(telegram_id)

        if (acconut_bind_un_bild_result) return '解除綁定成功'


    }

}



//檢查telegtam_id是否存在沒有則新增至 account ，true
function check_acconut_exist(telegram_id, telegram_username) {


    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) throw err


            const sql =
                `insert into account  (telegram_id,telegram_username)Select '${telegram_id}','${telegram_username}'`
                +
                `Where not exists(select * from account where telegram_id='${telegram_id}')`


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

//檢查telegtam_id是否已經綁定，true(以綁)，false(未綁)
async function check_acconut_bind(telegram_id) {

    //檢查帳號存在，沒有就創建
    await check_acconut_exist(telegram_id)

    return new Promise((resolve, reject) => {

        pool.getConnection((err, connection) => {

            const sql = `SELECT * FROM  account WHERE telegram_id = '${telegram_id}'AND user_name = ''limit 1 `

            console.log(sql)
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


//telegtam_id綁定

async function acconut_bind(telegram_id, user_name, telegram_username) {


    return new Promise((resolve, reject) => {

        //帳號寫入綁定的telegram_id，清除綁定碼

        pool.getConnection((err, connection) => {


            const sql = `UPDATE account SET telegram_id='${telegram_id}',bind_code='', telegram_username='${telegram_username}' WHERE user_name = '${user_name}'`

            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool
                if (!err)
                    resolve(true)
                else {
                    console.log(err)
                    resolve(false)
                }

            })
        })


        //刪除原本
        pool.getConnection((err, connection) => {

            const sql =
                `Delete FROM  account WHERE telegram_id = '${telegram_id}' AND user_name = '' limit 1 `

            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool
                if (err)
                    console.log(err)
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

            const sql = `UPDATE account SET telegram_id='',bind_code='TG@${md5(user_name).substr(0, 5)}', telegram_username='' WHERE user_name = '${user_name}'`

            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {
                    //刪除telegram_id訂閱資料
                    remove_account_sub_telegram_id(telegram_id)
                    resolve(true)
                }


                else {
                    console.log(err)
                    resolve(false)
                }


            })
        })

    })




}


//檢查bind_code存在，存在ture
function check_bind_code(bind_code) {
    return new Promise((resolve, reject) => {

        pool.getConnection((err, connection) => {

            const sql = `SELECT * FROM  account WHERE bind_code = '${bind_code}' limit 1`

            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool

                if (rows[0] == null)
                    resolve(false)
                else
                    resolve(rows[0].user_name)

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

            const sql =
                ` UPDATE account_sub SET user_name = '${acconut_info.user_name}' ,telegram_id = '${telegram_id}'  `
                + `WHERE  telegram_id = '${telegram_id}' OR user_name =  '${acconut_info.user_name}'`
            console.log(sql)
            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {
                    //刪除舊資料
                    merge_sub_data_dele_same(telegram_id)
                    console.log(acconut_info.user_name)
                    resolve(acconut_info.user_name)
                }
                else {
                    console.log(err)
                    resolve(false)
                }


            })
        })
    })
}



//刪除重復
function merge_sub_data_dele_same(telegram_id) {

    pool.getConnection((err, connection) => {

        const sql =
            ` DELETE n1 FROM account_sub n1, account_sub n2` +
            ` WHERE n1.id > n2.id AND n1.telegram_id = n2.telegram_id AND n1.user_name = n2.user_name AND n1.sub = n2.sub`
        connection.query(sql, (err, rows) => {
            connection.release() // return the connection to pool

            if (err)
                console.log(err)
        })
    })

}


//刪除account_sub TG id訂閱資料
function remove_account_sub_telegram_id(telegram_id) {

    pool.getConnection((err, connection) => {

        const sql = `UPDATE account_sub SET telegram_id=''WHERE telegram_id = '${telegram_id}'`

        connection.query(sql, (err, rows) => {
            connection.release() // return the connection to pool
            if (err)
                console.log(err)
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


