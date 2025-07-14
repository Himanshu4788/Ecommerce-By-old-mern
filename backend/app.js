const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
require('dotenv').config();
const cookieParser = require("cookie-parser")


app.use(express.json());
app.use(cookieParser())

//route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
// const cookieParser =  require("cookie-parser");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order );

//middleware for errors
app.use(errorMiddleware);




module.exports = app;
