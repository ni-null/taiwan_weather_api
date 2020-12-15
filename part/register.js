const http = require('http')
const path = require('path')
const mysql = require('mysql')


const rootPath = path.normalize(__dirname) + '/app.sock'


const con_mysql_info = require("../json/con_mysql_info.json");
const { promises } = require('fs');


// MySQL 連接
const pool = mysql.createPool(con_mysql_info)

module.exports = {
    creat_account: async function (data) {

        const exist = await this.check_account_exist(data.user_name)

        console.log(exist)


        if (!exist) {



            const result = await (async function () {
                return new Promise((resolve, reject) => {
                    pool.getConnection((err, connection) => {
                        if (err) throw err

                        const sql = `INSERT INTO account SET ? `
                        connection.query(sql, data, (err, rows) => {
                            connection.release() // return the connection to pool

                            if (!err) {
                                console.log('帳號新增成功')
                                resolve('帳號新增成功')
                            } else {
                                resolve(err)
                            }
                        })
                    })
                })

            })()

            return result




        }
        else {
            return ('用戶名已經存在，請替換')
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





