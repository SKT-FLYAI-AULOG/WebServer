const mysql = require('mysql2');

let conn;

async function connect() {
    try {
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'rlarudtn4582*',
            database: 'aulog',
        });
        return true;
    }
    catch(e) {
        return false;
    }
}

function query(sql, callback) {
    conn.query(sql, callback);    
}

async function close() {
    try {
        await conn.close();
        return true;
    }
    catch(e) {
        return false;
    }
}

module.exports = {
    connect: connect,
    query: query
};