const pool = require('../mysql');


module.exports = {
    creat_account: async function (data) {

        //檢查用戶存在
        const exist = await this.check_account_exist(data.user_name)

        if (!exist) {

            const result = await (async function () {
                return new Promise((resolve, reject) => {
                    pool.getConnection((err, connection) => {
                        if (err) throw err

                        const sql = `INSERT INTO account SET ? `
                        connection.query(sql, data, (err, rows) => {
                            connection.release() // return the connection to pool

                            if (!err) {
                                resolve('user_add_success:' + data.user_name)
                            } else {
                                console.log(err)
                                resolve('user_add_fail')
                            }
                        })
                    })
                })

            })()

            return result

        }
        else {
            return ('user_have_exist')
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





