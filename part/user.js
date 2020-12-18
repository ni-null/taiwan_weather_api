const pool = require('../mysql');



module.exports = {


    //新增訂閱
    add_sub: async function (user_name, sub) {

        const acconut_info = await get_acconut_info(user_name)

        console.log()

        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) throw err

                let slq

                if (acconut_info.telegram_id != null) {
                    sql =
                        `insert into account_sub  (user_name,telegram_id,sub)Select '${user_name}','${acconut_info.telegram_id}','${sub}'`
                        +
                        `Where not exists(select * from account_sub where user_name='${user_name}' AND sub='${sub}' AND telegram_id='${acconut_info.telegram_id}')`
                }

                else {
                    sql =
                        `insert into account_sub  (user_name,sub)Select '${user_name}','${sub}'`
                        +
                        `Where not exists(select * from account_sub where user_name='${user_name}' AND sub='${sub}')`
                }



                connection.query(sql, (err, rows) => {
                    connection.release() // return the connection to pool

                    if (!err) {
                        resolve('sub_success')

                    } else {
                        console.log(err)
                        resolve('sub_fail')
                    }

                })
            })

        }

        )

    }

    ,

    //獲取訂閱
    get_sub: function (user_name) {

        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) throw err

                const sql = `SELECT * FROM account_sub WHERE user_name = '${user_name}'`


                connection.query(sql, (err, rows) => {
                    connection.release() // return the connection to pool

                    if (!err) {
                        resolve(rows)

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
    delete_sub: function (user_name, sub) {

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





//獲取帳戶資訊
function get_acconut_info(user_name) {
    return new Promise((resolve, reject) => {

        pool.getConnection((err, connection) => {

            const sql = `SELECT * FROM  account WHERE user_name = '${user_name}'`

            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {
                    resolve(rows[0])
                }
                else console.log(err)

            })
        })

    })


}


