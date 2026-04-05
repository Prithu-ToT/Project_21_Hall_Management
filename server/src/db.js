const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 
    "postgresql://neondb_owner:npg_oBXHILVhM12D@ep-frosty-sunset-a1vkkssk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
, 
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;
