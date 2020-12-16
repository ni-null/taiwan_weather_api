const http = require('http')
const path = require('path')
const mysql = require('mysql')


const rootPath = path.normalize(__dirname) + '/app.sock'


const con_mysql_info = require("../json/con_mysql_info.json");
const { promises } = require('fs');
const { constants } = require('buffer');


// MySQL 連接
const pool = mysql.createPool(con_mysql_info)

module.exports = {



    add_sub: async function (telegtam_id, sub_data) {


        //檢查telegtam_id是否存在沒有則新增至 account
        const check_result = await check_acconut_exist(telegtam_id)


        //獲取帳戶資料
        const account_info = await get_acconut_info(telegtam_id)

        //傳送訂閱資料
        const sub_result = await sub_send(sub_data, account_info.telegram_id, account_info.user_name)


        return sub_result


    }

    ,

    get_sub:
        function (user_name) {

            return new Promise((resolve, reject) => {
                pool.getConnection((err, connection) => {
                    if (err) throw err

                    const sql = `SELECT * FROM account_sub WHERE user_name = '${user_name}'`


                    connection.query(sql, (err, rows) => {
                        connection.release() // return the connection to pool

                        if (!err) {
                            resolve(rows)

                        } else {

                            resolve(false)
                            console.log('sub_fail')
                        }

                    })
                })

            }

            )

        }
    ,
    delete_sub:
        function (user_name, sub) {

            return new Promise((resolve, reject) => {
                pool.getConnection((err, connection) => {
                    if (err) throw err

                    const sql = `DELETE FROM account_sub WHERE user_name = '${user_name}' AND sub = '${sub}'`


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

}



//檢查telegtam_id是否存在沒有則新增至 account
function check_acconut_exist(telegram_id) {


    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) throw err

            const sql =
                `insert into account  (telegram_id)Select '${telegram_id}'`
                +
                `Where not exists(select * from account where telegram_id='${telegram_id}')`


            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {
                    resolve(true)

                } else {
                    resolve(false)
                }

            })
        })

    })
}


function get_acconut_info(telegram_id) {
    return new Promise((resolve, reject) => {

        pool.getConnection((err, connection) => {

            const sql = `SELECT * FROM  account WHERE telegram_id = '${telegram_id}'`

            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool


                resolve(rows[0])
            })
        })

    })


}














function sub_send(sub_data, telegram_id, user_name) {


    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) throw err

            let sql

            if (user_name == null)
                sql = `insert into account_sub  (telegram_id,sub)Select '${telegram_id}','${sub_data}'
                Where not exists(select * from account_sub where telegram_id='${telegram_id}' AND  sub ='${sub_data}')`
            else
                sql = `insert into account_sub  (user_name,telegram_id,sub)Select '${user_name}','${telegram_id}','${sub_data}'
                Where not exists(select * from account_sub where telegram_id='${telegram_id}' AND  sub ='${sub_data}')`


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

