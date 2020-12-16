
const mysql = require('mysql')
const con_mysql_info = require("../json/con_mysql_info.json");
const { promises } = require('fs');


// MySQL 連接
const pool = mysql.createPool(con_mysql_info)

module.exports = {
    check: async function (data) {

        //檢查用戶名是否存在
        const exist = await this.check_account_exist(data.user_name)

        console.log(exist)

        //存在
        if (exist) {



            const result = await (async function () {
                return new Promise((resolve, reject) => {



                    pool.getConnection((err, connection) => {
                        if (err) throw err

                        const sql = `SELECT * FROM account WHERE user_name  = '${data.user_name}' AND user_passowrd  = '${data.user_passowrd}' `
                        connection.query(sql, data, (err, rows) => {
                            connection.release() // return the connection to pool

                            if (!err) {

                                if (rows[0] == null) resolve('passowrd_error')

                                return resolve('success')
                            } else {
                                return resolve(err)
                            }
                        })
                    })


                })

            })()

            return result

        }
        else {
            return ('user no exsit')
        }

        //不存在則創建帳號


    }
    ,

    check_account_exist: function (user_name) {


        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) throw err

                const sql = `select 1 from account where user_name = '${user_name}' limit 1`

                connection.query(sql, (err, rows) => {
                    connection.release() // return the connection to pool

                    if (!err) {
                        console.log(rows)
                        if (rows[0] != null) resolve(true)
                        else resolve(false)

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





