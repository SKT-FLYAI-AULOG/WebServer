const mysql = require('mysql2');

let conn;

async function connect() {
    try {
        conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '1234',
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
