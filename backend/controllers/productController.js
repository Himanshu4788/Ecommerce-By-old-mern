
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeature = require("../utils/apifeature");
const qs = require("qs");


//create product --admin
exports.createProduct = catchAsyncError(async(req,res , next)=>{
 
 
 req.body.user = req.user.id
 
 
 const product = await Product.create(req.body);

 res.status(201).json({
    success:true,
    product
 })
})

//get all product


exports.getALLProducts = catchAsyncError(async (req, res) => {
    
    const resultPerPage = 5;
    const productCount = await Product.countDocuments();

    const parsedQuery = qs.parse(req.query);
    const apifeature = new ApiFeature(Product.find(), parsedQuery).search().filter().pagination(resultPerPage );
    const products = await apifeature.query;

    res.status(200).json({
        success: true,
        products
    });
});



//get product details
exports.getProductDetails =  catchAsyncError(async(req,res,next)=>{
    
    const product = await Product.findById(req.params.id)

     if(!product)
         {
            return next(new ErrorHandler("product not found" , 404))
         }
        
        res.status(200).json({
            success:true,
            product,
            productCount 
        })
})


//update product -- admin
exports.updateProduct = catchAsyncError(async (req,res,next)=>{
   let product = await Product.findById(req.params.id);
   if(!product){
       return next(new ErrorHandler("product not found" , 404))
    }

    product  = await Product.findByIdAndUpdate(req.params.id , req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
         product
    })

})


//delete

exports.deleteProduct = catchAsyncError(async (req,res,next)=>{
     const product = await Product.findById(req.params.id)

     if(!product)
         {
            return next(new ErrorHandler("product not found" , 404))
         }


        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success:true,
            message:"product delete successfully"
        })

})

// Create or update a product review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    // ✅ Update existing review
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    
    product.reviews.push(review);
    product.numofReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: isReviewed ? "Review updated" : "Review added",
  });
});


//get all reviews of a single product
exports.getProductReview = catchAsyncError(async (req, res, next) => {
      const product = await Product.findById(req.params.id)

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

  res.status(200).json({
    success: true,
    reviews  : product.reviews
  });

})

// Get all reviews of a single product
exports.getProductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id); // ✅ Fixed

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});


//delete reviews
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = reviews.length === 0 ? 0 : avg / reviews.length;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Review deleted",
  });
});
