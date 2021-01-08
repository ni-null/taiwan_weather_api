const pool = require('../mysql');


module.exports = {

    //創建帳號
    creat_account: async function (data) {

        //檢查用戶存在
        const exist = await check_account_exist(data.user_name)

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


    },
    //檢查登入
    check_login: async function (data) {

        //檢查用戶名是否存在
        const exist = await check_account_exist(data.user_name)



        //存在
        if (exist) {

            const result = await check_passowrd(data.user_name, data.user_passowrd)

            return result

        }
        else {

            return (false)
        }




    }
    ,
    //修改密碼
    change_passowrd: async function (data) {


        //檢查舊密碼
        const check_passowrd_result = await check_passowrd(data.user_name, data.user_passowrd_old)



        if (check_passowrd_result) {

            const result = await change_passowrd(data.user_name, data.user_passowrd_new)

            return result

        }


        else
            return false

    }
    ,
    //獲取telegram_username,bind_code
    get_telegram: async function (user_name) {

        const result = await get_telegram_data(user_name)

        return result

    }



}

//檢查帳號存在
function check_account_exist(user_name) {


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



//檢查密碼正確，
function check_passowrd(user_name, user_passowrd) {


    return new Promise((resolve, reject) => {

        pool.getConnection((err, connection) => {
            if (err) throw err

            const sql = `SELECT 1 FROM account WHERE user_name  = '${user_name}' AND user_passowrd  = '${user_passowrd}' `

            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {

                    //沒有結果
                    if (rows[0] == null) resolve(false)
                    else resolve(true)


                } else {
                    console.log(err)
                    resolve(false)
                }
            })
        })


    })



}


//修改密碼
function change_passowrd(user_name, user_passowrd_new) {

    return new Promise((resolve, reject) => {

        pool.getConnection((err, connection) => {
            if (err) throw err
            const sql = `UPDATE account SET user_passowrd='${user_passowrd_new}'  WHERE user_name = '${user_name}'`

            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) resolve(true)
                else {
                    console.log(err)
                    resolve(false)
                }
            })
        })


    })



}


//獲取telegtam資料

function get_telegram_data(user_name) {

    return new Promise((resolve, reject) => {

        pool.getConnection((err, connection) => {
            if (err) throw err

            const sql = `select telegram_username,bind_code from account where user_name = '${user_name}' limit 1`
            connection.query(sql, (err, rows) => {
                connection.release() // return the connection to pool
                if (!err) resolve(rows[0])
                else {
                    console.log(err)
                    resolve(false)
                }
            })
        })


    })



}

