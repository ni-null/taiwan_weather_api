const http = require('http')
const path = require('path')
const mysql = require('mysql')


const rootPath = path.normalize(__dirname) + '/app.sock'


const con_mysql_info = require("../json/con_mysql_info.json");
const { promises } = require('fs');


// MySQL 連接
const pool = mysql.createPool(con_mysql_info)

module.exports = {



    add_sub: function (user_name, sub) {

        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) throw err

                const sql = `insert into account_sub  (user_name,sub)Select '${user_name}','${sub}' Where not exists(select * from account_sub where user_name='${user_name}' AND sub='${sub}')`


                connection.query(sql, (err, rows) => {
                    connection.release() // return the connection to pool

                    if (!err) {
                        resolve('sub_success')

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





