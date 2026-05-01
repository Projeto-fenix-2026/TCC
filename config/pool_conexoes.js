const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT,
    waitForConnections:true,
    connectionLimit:4,
    queueLimit:0
});


pool.getConnection((err, conn)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Conectado ao SGBD!");
    }    
})

module.exports = pool.promise();