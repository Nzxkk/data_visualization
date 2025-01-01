const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors()); 
const router=require("./sales/index")

app.use("/api",router)
app.listen(3006, () => {
  console.log('服务器启动 http://127.0.0.1:3006');
});
