const userModel = require("../models/users.model");
const jwt = require("jsonwebtoken");

let token_secret_key = process.env.TOKEN_SECRET_KEY;

exports.create_user = async (req, res) => {
  try {
    const { user_email, user_role } = req.body;
    const { token } = req.headers;

    let is_existing_user = await userModel.findOne({ user_email });
    let check_user_role = jwt.verify(token, token_secret_key);
    console.log("token details", check_user_role);

    if (user_role == "manager") {
      if (check_user_role.role == "admin") {
        if (is_existing_user) {
          return res
            .status(409)
            .send({ status: false, message: "email already exist" });
        } else {
          let new_user = await userModel.create(req.body);
          return res.status(200).send({
            status: true,
            message: "new manager added successfully",
            new_user: new_user,
          });
        }
      } else {
        return res
          .status(401)
          .send(`you do not have access to create ${user_role}`);
      }
    } else if (user_role == "user") {
      if (check_user_role.role == "manager") {
        if (is_existing_user) {
          return res
            .status(409)
            .send({ status: false, message: "email already exist" });
        } else {
          let new_user = await userModel.create({
            ...req.body,
            manager: check_user_role.id,
          });
          return res.status(200).send({
            status: true,
            message: "new user added successfully",
            new_user: new_user,
          });
        }
      } else {
        return res
          .status(401)
          .send(`you do not have access to create ${user_role}`);
      }
    }
    // else if (user_role == "admin") {
    //   let admin = await userModel.create(req.body);
    //   return res.status(200).send({
    //     stauts: true,
    //     message: "Admin Added successfully",
    //     admin: admin,
    //   });
    else {
      return res
        .status(401)
        .send(`you do not have access to create ${user_role}`);
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "server error while creating user" });
  }
};

exports.authenticate_user = async (req, res) => {
  try {
    let { user_email, user_password } = req.body;
    let is_user = await userModel.findOne({ user_email });
    console.log("check login", is_user);
    if (!is_user) {
      return res
        .status(404)
        .send({ status: false, message: "user not found!" });
    } else if (is_user.user_password != user_password) {
      return res
        .status(401)
        .send({ status: false, message: "password do not match" });
    } else {
      req.session.details = { _id: is_user._id, email: is_user.user_email };

      const jwt_token = jwt.sign(
        {
          id: is_user._id,
          email: is_user.user_email,
          role: is_user.user_role,
        },
        token_secret_key,
        {
          expiresIn: "20 min",
        }
      );

      console.log(req.session.details);
      return res.status(200).send({
        status: true,
        message: "login successfull!",
        token: jwt_token,
        user_name: is_user.user_name,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "server error while login" });
  }
};

exports.user_list = async (req, res) => {
  try {
    let { token } = req.headers;
    let check_user_role = jwt.verify(token, token_secret_key);
    console.log("cheeck user role", check_user_role);
    if (check_user_role.role == "admin") {
      let data = await userModel.find({ user_role: "manager" });
      return res
        .status(200)
        .send({ status: true, message: "Manager Lists", body: data });
    } else if (check_user_role.role == "manager") {
      console.log("manager login", check_user_role);
      let data = await userModel.find({ manager: check_user_role.id });
      return res
        .status(200)
        .send({ status: true, message: "Users Lists", body: data });
    } else {
      return res.status(401).send({
        status: true,
        message: "you can not have access to perform this operation",
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: "server error while getting user lists",
    });
  }
};
