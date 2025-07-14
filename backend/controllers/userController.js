
const User = require("../models/userModel")
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeature = require("../utils/apifeature");
const qs = require("qs");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")


//registration 
exports.registerUser = catchAsyncError( async (req,res,next)=>{
    const{name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"temp",
            url:"profileurl"
        }
    })


    const token = user.getJWTToken()

    sendToken(user,201,res)
})



//login user
exports.loginUser = catchAsyncError( async (req,res,next)=>{

    const {email , password} = req.body
    //check krenge if user  has given password and email
    if(!email || !password)
         {
            return next(new ErrorHandler("pleae enter email ans password" , 400))
         }


         const user = await  User.findOne({email}).select("+password");
         
         if(!user)
            {
                return next(new ErrorHandler("invalid email or password", 401))
            }
            
        const isPasswordMatch = await user.comparePassword(password);

        if(!isPasswordMatch)
            {
                return next(new ErrorHandler("invalid email or password", 401))
            }


         sendToken(user,200,res)

        
})

//logout user
exports.logout = catchAsyncError(async (req,res,next)=>{

    res.cookie("token" , null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"logged out"
    })
})


//forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  
  // get reset password token or forgot password
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is:\n\n${resetPasswordUrl}\n\nIf you did not request this email, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});


// reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  //creating token hash
   const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex") 

   const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{ $gt : Date.now() },
   })

   if (!user) {
    return next(new ErrorHandler("reset password token is invalid or has been expire", 400));
   }


   if(req.body.password !== req.body.confirmPassword)
   {
      return next(new ErrorHandler("old password is invalid ", 400));
   }

   user.password = req.body.password
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;


  await user.save()

  sendToken(user , 200 , res)

})

//get user(itself) details
exports.getUserDetails = catchAsyncError(async (req,res , next)=>{
  
  const user = await User.findById(req.user.id)
  res.status(200).json({
    success:true,
    user,
  })
  
})

//update user password
exports.updateUserpassowrd = catchAsyncError(async (req,res , next)=>{
  
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

   if(!isPasswordMatch)
      {
          return next(new ErrorHandler("invalid old password", 400))
      }

   if(req.body.newPassword !== req.body.confirmPassword)
      {
          return next(new ErrorHandler("Password doesnot match", 400))
      }


      user.password = req.body.newPassword
      await user.save()


     sendToken(user,200,res)
  
})


//update user profile by itself
exports.updateProfile= catchAsyncError(async (req,res , next)=>{
  
  
  const newUserData={
    name:req.body.name,
    email:req.body.email,
  }

   //we will add cloudinary later

   const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false
   })

   res.status(200).json({
    success:true,
  })
})

//get all user  
exports.getAllUser= catchAsyncError(async (req,res , next)=>{
 
   const users = await User.find();
   res.status(200).json({
    success:true,
    users,
   })
})


//get  users deatils when admin want (admin)
exports.getSingleUser= catchAsyncError(async (req,res , next)=>{
 
   const user = await User.findById(req.params.id);

   if (!user) {
      return next(new ErrorHandler(`user does not exit with id:${req.params.id}, 400`));
   }

   res.status(200).json({
    success:true,
    user,
   })
})
// Admin will update another user's profile
exports.updateUserProfileByAdmin = catchAsyncError(async (req, res, next) => {
  const userToUpdate = await User.findById(req.params.id);

  if (!userToUpdate) {
    return next(new ErrorHandler(`User does not exist with ID: ${req.params.id}`, 400));
  }

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role, 
  };

  const updatedUser = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});

// Admin will delete the user profile 
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist with ID: ${req.params.id}`, 400));
  }

  // Delete user
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
