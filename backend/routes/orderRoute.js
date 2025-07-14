const express = require("express");
const router = express.Router();
const { isAuthUser ,authorizedRoles } = require("../middleware/auth");
const{
    newOrder,
    myOrder,
    getSingleOrder,
    getAllOrder,
    updateOrder,
    deleteOrder,


} = require("../controllers/ordeController")

router.route("/order/new").post(isAuthUser,newOrder)

router.route("/order/me").get(isAuthUser,myOrder)

router.route("/order/:id").get(isAuthUser,authorizedRoles("admin"),getSingleOrder)

router.route("/admin/orders").get(isAuthUser,authorizedRoles("admin"),getAllOrder)

router.route("/admin/order/:id").put(isAuthUser,authorizedRoles("admin"),updateOrder)

router.route("/admin/order/:id").delete(isAuthUser,authorizedRoles("admin"),deleteOrder)



module.exports = router