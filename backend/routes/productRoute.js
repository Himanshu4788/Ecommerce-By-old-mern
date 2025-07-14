const express = require("express");
const router = express.Router();

const {  getALLProducts ,createProduct ,updateProduct ,deleteProduct ,getProductDetails ,createProductReview,deleteReview,
    getProductReview,
 } = require("../controllers/productController");
const { isAuthUser ,authorizedRoles } = require("../middleware/auth");

router.route("/products").get(getALLProducts)

router.route("/admin/product/new").post(isAuthUser ,authorizedRoles("admin")  ,createProduct)

router.route("/admin/product/:id").put(isAuthUser ,authorizedRoles("admin") ,updateProduct)

router.route("/admin/product/:id").delete(isAuthUser ,authorizedRoles("admin")  ,deleteProduct)

router.route("/product/:id").get(getProductDetails)

router.route("/review").put(isAuthUser, createProductReview);

router.route("/reviews").delete(isAuthUser,deleteReview);

router.route("/reviews").get(getProductReview);

module.exports = router