const Order = require("../models/oderModel")

const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeature = require("../utils/apifeature");
const qs = require("qs");

//create new order
exports.newOrder = catchAsyncError(async(req,res,next)=>{
   const {shippingInfo , orderItems , paymentInfo , itmesPrice,taxPrice,
    shippingPrice,
    totalPrice,
   } = req.body ;

   const order = await Order.create({
    shippingInfo , orderItems , paymentInfo , itmesPrice,taxPrice,
    shippingPrice,
    totalPrice,
    paidAt:Date.now(),
    user:req.user._id,
   })

   res.status(201).json({
      success:true,
      order
   })
})

//get Single order details
exports.getSingleOrder = catchAsyncError(async(req,res,next)=>{
  const order = await Order.findById(req.params.id).populate("user" , "name email")
  if(!order)
     {
         return next(new ErrorHandler("order nor found" , 404))
     }


   res.status(201).json({
      success:true,
      order
   })
})

//get jisne login kra usko apne order
exports.myOrder = catchAsyncError(async(req,res,next)=>{
  const order = await Order.find({user:req.user._id})
 

   res.status(201).json({
      success:true,
      order
   })
})

//get all order --admin
exports.getAllOrder = catchAsyncError(async(req,res,next)=>{
  const orders = await Order.find()
 
  let totalAmount = 0
  orders.forEach(order=>{
    totalAmount+=order.totalPrice
  })



   res.status(201).json({
      success:true,
      totalAmount,
      orders
   })
})


//update order Status --admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  for (const item of order.orderItems) {
    await updateStock(item.product, item.quantity);
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Order status updated"
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error(`Product not found for ID: ${id}`);
  }
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}



//delte order --admin
exports.deleteOrder = catchAsyncError(async(req,res,next)=>{
  const order = await Order.findById(req.params.id)
   
  if(!order)
     {
         return next(new ErrorHandler("order nor found" , 404))
     }

 await Order.findByIdAndDelete(req.params.id); 

   res.status(201).json({
      success:true,
      message:"delete successfully"
   })
})


