const { uploadFile } = require("../function/upload");
const userModel = require("../models/users.model");
const jwt = require("jsonwebtoken");

let token_secret_key = process.env.TOKEN_SECRET_KEY;

exports.create_user = async (req, res) => {
  try {
    console.log("req body", req.body);
    console.log(req.files, "filess");
    const { user_email, user_role } = req.body;
    let is_existing_user = await userModel.findOne({ user_email });
    console.log("hhhhhhhhhh", is_existing_user);
    if (is_existing_user) {
      return res
        .status(409)
        .send({ status: false, message: "email already exist" });
    } else {
      const url = await uploadFile(req.files.image.data);
      console.log(url);
      const { token } = req.headers;
      let check_user_role = await new Promise((resolve, reject) => {
        jwt.verify(token, token_secret_key, (error, decoded) => {
          if (error) {
            reject({ status: false, error: error });
          } else {
            resolve({ status: true, decoded: decoded });
          }
        });
      });
      if (check_user_role.status) {
        console.log("check user role", check_user_role);
        const data = {
          user_name: req.body.user_name,
          user_email: req.body.user_email,
          user_password: req.body.user_password,
          user_role: req.body.user_role,
          user_dob: req.body.user_dob,
          user_phone_number: req.body.user_phone_number,
          manager: check_user_role.decoded.id,
          image: url,
        };
        const response = await userModel.create(data);
        console.log(response);
        return res.status(200).send({
          status: true,
          message: `new ${req.body.user_role} added successfully`,
        });
      } else {
        console.log(check_user_role, "chekc rol");
        return res.status(500).send({ status: false, message: "Token Expire" });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error" });
  }
};
// exports.create_user = async (req, res) => {
//   try {
//     const { user_email, user_role } = req.body;
//     console.log("user email", user_email);
//     const { token } = req.headers;
//     console.log("chek create user", token);
//     let is_existing_user = await userModel.findOne({ user_email });
//     let check_user_role = jwt.verify(token, token_secret_key);
//     console.log("role", check_user_role, is_existing_user);

//     if (user_role == "manager") {
//       if (check_user_role.role == "admin") {
//         if (is_existing_user) {
//           return res
//             .status(409)
//             .send({ status: false, message: "email already exist" });
//         } else {
//           let new_user = await userModel.create(req.body);
//           // await sendMail(new_user);
//           return res.status(200).send({
//             status: true,
//             message: "new manager added successfully",
//             new_user: new_user,
//           });
//         }
//       } else {
//         return res.status(401).send({
//           status: false,
//           message: `you do not have access to create ${user_role}`,
//         });
//       }
//     } else if (user_role == "user") {
//       console.log("check user role", user_role);
//       if (check_user_role.role == "manager") {
//         console.log("check manger role", check_user_role.role);
//         if (is_existing_user) {
//           return res
//             .status(409)
//             .send({ status: false, message: "email already exist" });
//         } else {
//           console.log("user data", req.body);
//           let new_user = await userModel.create({
//             ...req.body,
//             manager: check_user_role.id,
//           });
//           console.log(new_user, "new_user");
//           return res.status(200).send({
//             status: true,
//             message: "new user added successfully",
//             new_user: new_user,
//           });
//         }
//       } else {
//         return res.status(401).send({
//           status: false,
//           message: `you do not have access to create ${user_role}`,
//         });
//       }
//     } else {
//       return res.status(401).send({
//         status: false,
//         message: `you do not have access to create ${user_role}`,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(500)
//       .send({ status: false, message: "server error while creating user" });
//   }
// };

exports.authenticate_user = async (req, res) => {
  try {
    let { user_email, user_name, user_password } = req.body;
    let is_user = await userModel.findOne({ user_name });
    console.log("check login", is_user);
    if (!is_user) {
      return res
        .status(404)
        .send({ status: false, message: "user not found!" });
    } else if (is_user.user_password != user_password) {
      return res
        .status(401)
        .send({ status: false, message: "password do not match" });
    } else if (is_user.user_role == "user") {
      return res.status(401).send({
        status: false,
        message: "you are not allowed perform any operations",
      });
    } else {
      const jwt_token = jwt.sign(
        {
          id: is_user._id,
          user_name: is_user.user_name,
          role: is_user.user_role,
        },
        token_secret_key,
        {
          expiresIn: "180 min",
        }
      );
      // req.session.details = {
      //   _id: is_user._id,
      //   email: is_user.user_email,
      //   token: jwt_token,
      // };
      // console.log("session", req.session.details);
      return res.status(200).send({
        status: true,
        message: "login successfull!",
        // user_name: is_user.user_name,
        token: jwt_token,
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
    let { id } = req.query;
    console.log("id==============", id);
    let check_user_role = jwt.verify(token, token_secret_key);
    console.log("jwt check", check_user_role.role);
    if (check_user_role.role == "admin") {
      if (id) {
        let data = await userModel.find({ manager: id });
        return res
          .status(200)
          .send({ status: true, message: "Manager user Lists", body: data });
      } else {
        let data = await userModel.find({ user_role: "manager" });
        return res
          .status(200)
          .send({ status: true, message: "Manager Lists", body: data });
      }
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
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "server error while getting user lists",
    });
  }
};

exports.edit_user = async (req, res) => {
  try {
    let { token } = req.headers;
    let check_user_role = jwt.verify(token, token_secret_key);
    let find_user_by_id = await userModel.findOne({ _id: req.params.id });
    console.log("req, params", req.params);
    if (!find_user_by_id) {
      return res.status(409).send({ status: false, message: "user not found" });
    } else if (
      find_user_by_id.user_role == "manager" &&
      check_user_role.role == "admin"
    ) {
      if (req.body.user_role == "user") {
        return res
          .status(401)
          .send({ status: false, message: "you can not edit manager to user" });
      }
      // let checking_existing_mail = await userModel.findOne({
      //   user_email: req.body.user_email,
      // });
      let updated_user = await userModel.updateOne(
        { _id: req.params.id },
        {
          $set: {
            user_name: req.body.user_name,
            user_role: req.body.user_role,
            user_email: req.body.user_email,
            user_dob: req.body.user_dob,
            user_password: req.body.user_password,
            user_phone_number: req.body.user_phone_number,
          },
        },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "updated successfully",
        data: updated_user,
      });
    } else if (
      find_user_by_id.user_role == "user" &&
      check_user_role.role == "manager"
    ) {
      if (req.body.user_role == "manager" || req.body.user_role == "admin") {
        return res.status(401).send({
          status: false,
          message: `you can not edit user to ${req.body.user_role}`,
        });
      }
      let checking_existing_mail = await userModel.find({
        user_email: req.body.user_email,
      });
      // if (checking_existing_mail) {
      //   return res
      //     .status(401)
      //     .send({ status: false, message: "email id already exist" });
      // }
      let updated_user = await userModel.updateOne(
        { _id: req.params.id },
        {
          $set: {
            user_name: req.body.user_name,
            user_role: req.body.user_role,
            user_email: req.body.user_email,
            user_dob: req.body.user_dob,
            user_password: req.body.user_password,
            user_phone_number: req.body.user_phone_number,
          },
        },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "updated successfully",
        data: updated_user,
      });
    }
  } catch (err) {
    console.log("error", err);
    return res.status(500).send({
      status: false,
      message: "Server error while editing the user",
    });
  }
};

exports.get_user_by_id = async (req, res) => {
  try {
    let { id } = req.params;
    let manager_data = await userModel.findOne({ _id: id });
    return res.status(200).send({ status: true, body: manager_data });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Server error while editing the user",
    });
  }
};

exports.delete_user = async (req, res) => {
  try {
    let { token } = req.headers;
    let { id } = req.params;
    let check_user_role = jwt.verify(token, token_secret_key);
    let find_user_by_id = await userModel.findOne({ _id: id });

    if (!find_user_by_id) {
      return res.status(409).send({ status: false, message: "user not found" });
    } else if (
      find_user_by_id.user_role == "manager" &&
      check_user_role.role == "admin"
    ) {
      let deleted_user = await userModel.deleteOne({ _id: id });
      return res.status(200).send({
        status: true,
        message: "user Deleted !",
        deleted_user: deleted_user,
      });
    } else if (
      find_user_by_id.user_role == "user" &&
      check_user_role.role == "manager"
    ) {
      let deleted_user = await userModel.deleteOne({ _id: id });
      return res.status(200).send({
        status: true,
        message: "user Deleted !",
        deleted_user: deleted_user,
      });
    } else {
      return res.status(409).send({
        status: false,
        message: `you can not delete ${find_user_by_id.user_role}`,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "server while deleting user" });
  }
};

exports.check_session = (req, res) => {
  try {
    console.log(req.session);
    if (req.session) {
      return res.status(200).send({
        status: true,
        message: "session found",
        body: req.session,
      });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "session not found" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "server error while checking sessions" });
  }
};
