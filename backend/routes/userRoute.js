const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateUserpassowrd,
  updateProfile,
  getAllUser,
  getSingleUser,
  deleteUser,
  updateUserProfileByAdmin,

} = require("../controllers/userController");

const router = express.Router();

const { isAuthUser, authorizedRoles  } = require("../middleware/auth");


router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthUser, getUserDetails);

router.route("/password/update").put(isAuthUser, updateUserpassowrd);

router.route("/me/update").put(isAuthUser, updateProfile);

router.route("/admin/users").get(isAuthUser, authorizedRoles("admin"),getAllUser);

router.route("/admin/user/:id").get(isAuthUser, authorizedRoles("admin"),getSingleUser);

router.route("/admin/user/:id").put(isAuthUser, authorizedRoles("admin"),updateUserProfileByAdmin);

router.route("/admin/user/:id").delete(isAuthUser, authorizedRoles("admin"),deleteUser);

module.exports = router;
