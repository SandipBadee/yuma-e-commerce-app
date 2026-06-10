const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "yuma_db",
    password: "bade_pgsql",
    port: 5432,
});

module.exports = pool;