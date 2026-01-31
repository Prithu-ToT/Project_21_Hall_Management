const express = require("express");
const cors = require("cors");
const {Pool} = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const neon_con = "postgresql://neondb_owner:npg_oBXHILVhM12D@ep-frosty-sunset-a1vkkssk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const pool = new Pool({
    connectionString : neon_con,
    ssl : {rejectUnauthorized : false}
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.get("/", (req, res) => {
  res.send("Server is alive!");
});

app.get("/sample/:id", (req, res)=>{

    const thingy = [
        {id: 5, name : "five"},
        {id: 4, name : "four"}
    ]

    const id = Number(req.params.id);
    const reqThingy = thingy.find((t) => t.id === id);
    res.json(reqThingy);
})