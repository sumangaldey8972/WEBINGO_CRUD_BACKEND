const express = require("express");
const {
  create_user,
  authenticate_user,
  user_list,
} = require("../controller/user.controller");

const router = express.Router();

router.post("/create_user", create_user);
router.post("/authenticate_user", authenticate_user);

router.get("/user_list", user_list);

module.exports = router;
