const app = require("./app");
const dotenv = require("dotenv");

const connectDatabase = require("./config/database")


//handling uncaught Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`)
    console.log(`shutting down the server due to unhandle uncaught Exception`);
    process.exit(1)
})

dotenv.config({ path: "backend/config/config.env" });

connectDatabase()

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});



//unhandle promise rejection
process.on("unhandledRejection" , err=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to unhandle promise rejection`);
    
    server.close(()=>{
        process.exit(1);
    })
})