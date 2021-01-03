/* mysql  */
const mysql = require('mysql')

const pool = mysql.createPool({
    "connectionLimit": 40,
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "weather",
    multipleStatements: true
});


module.exports = pool;