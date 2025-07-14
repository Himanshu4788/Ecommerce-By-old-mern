const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";


    //wronge mongodb id error
    if(err.name === "CastError")
    {
        const message = `resource not found  invalid : ${err.path} `
        err=new ErrorHandler(message,400)
    }



 //mongoose duplicate key error
   if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0]; 
      const message = `Duplicate ${field} entered`;
      err = new ErrorHandler(message, 400);
   }

   //worng jwt error
   if (err.name === "JsonWebTokenError") { 
      const message = `Json web token is invlaid, try again`;
      err = new ErrorHandler(message, 400);
   }

   //jwt expire error
   if (err.name === "TokenExpireError") { 
      const message = `Json web token is expire, try again`;
      err = new ErrorHandler(message, 400);
   }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
