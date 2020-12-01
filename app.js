const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const cors = require('cors')
app.use(cors())



const con_mysql_info = require("./json/con_mysql_info.json");


const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())

// MySQL 連接
const pool = mysql.createPool(con_mysql_info)

// Get all beers
app.get('', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * from beers', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

        })
    })
})

// 防止捕獲圖標
app.get('/favicon.ico', (req, res) => res.status(204));

// 獲取資料
app.get('/city/:city_name', (req, res) => {


    console.log([req.params])

    pool.getConnection((err, connection) => {
        if (err) throw err

        connection.query('SELECT * from ' + [req.params.city_name], (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

        })
    })
})


// Listen on enviroment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`))