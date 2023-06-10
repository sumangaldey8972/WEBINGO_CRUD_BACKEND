const express = require("express");
const {
  create_user,
  authenticate_user,
  user_list,
  edit_user,
  delete_user,
  check_session,
} = require("../controller/user.controller");

const router = express.Router();

router.post("/create_user", create_user);
router.post("/authenticate_user", authenticate_user);

router.get("/user_list", user_list);

router.patch("/edit_user/:id", edit_user);

router.delete("/delete_user/:id", delete_user);

router.get("/check_session", check_session);

module.exports = router;
