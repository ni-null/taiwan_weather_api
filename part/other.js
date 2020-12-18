// MySQL 連接
const pool = require('../mysql');


module.exports = {



    get_wather: function (city_name) {

        console.log('123')
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

}