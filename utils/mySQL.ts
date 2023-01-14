import mysql from 'mysql'
import dotenv from 'dotenv'
dotenv.config()


const pool = mysql.createPool({
    connectionLimit: 1,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT),
    debug: false
})

const mySQL = {
    GetData(query: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            return pool.query(query, [], (err, data) => {
                if (err) return reject(err);
                resolve(JSON.parse(JSON.stringify(data)));
            })
        })
    }
    ,
    InsertOrUpdate(query: string, data: any[]) {
        return new Promise((resolve, reject) => {
            return pool.query(query, data, (err, data) => {
                if (err) return reject(err);
                resolve(data.affectedRows);
            })
        })
    }
}

export default mySQL