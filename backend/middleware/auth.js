const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")


exports.isAuthUser = catchAsyncError(async (req,res,next)=>{
    const {token} = req.cookies;
    // console.log(token);

    if(!token){
        return next(new ErrorHandler("please login first" , 401))
    }

    const decodeddata = jwt.verify(token , process.env.JWT_SECRET)
    req.user =   await User.findById(decodeddata.id)
    
    next()

})


exports.authorizedRoles = (...roles)=>{

    return (req,res,next)=>{
            if(!roles.includes(req.user.role)){
              return next(new ErrorHandler(`Roles:${req.user.role} is not allowed to access the resouce` , 403))
            }

            next()

    };
}