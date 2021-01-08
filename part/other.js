// MySQL 連接
const pool = require('../mysql');


module.exports = {


    //獲取天氣
    get_wather: function (city_name) {


        return new Promise((resolve, reject) => {

            pool.getConnection((err, connection) => {
                if (err) throw err

                connection.query('SELECT * from ' + city_name, (err, rows) => {
                    connection.release() // return the connection to pool

                    if (!err) {
                        resolve(rows)
                    } else {
                        console.log(err)
                        resolve(false)
                    }

                })
            })
        })

    }
    ,

    //創建訂閱表
    creat_account_sub_table_in_mysql: function () {


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
    ,

    //創建帳號表
    creat_account_table_in_mysql: function () {


        pool.getConnection((err, connection) => {
            if (err) throw err

            const sql = `create table if not exists account(
                id int primary key auto_increment,
                user_name varchar(128) not null,
                user_passowrd varchar(128) not null,
                telegram_id varchar(128)not null ,
                telegram_username varchar(255) not null ,
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




}