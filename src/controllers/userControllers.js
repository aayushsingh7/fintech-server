import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const hashPassword = async (plainPassword) => {
  const saltRounds = 10;

  let hashedPassword = await bcryptjs.hash(plainPassword, saltRounds);
  return hashedPassword;
};

const generateJWTToken = (userID) => {
  const token = jwt.sign({ _id: userID }, process.env.SECRET_KEY, {
    expiresIn: "15d",
  });
  return token;
};

// FUTURE UPDATE: USE OF BLOOM FILTER ALGORITHM FOR LOGIN & REGISTER

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!user)
      return res.status(404).send({
        message: "User does not exist with the given email or username",
        success: false,
        user: user,
      });

    let isValidPassword = await bcryptjs.compare(password, user.password);

    if (isValidPassword) {
      let token = generateJWTToken(user._id);
      res
        .cookie("trial", token, {
          sameSite: "none",
          httpOnly: true,
          secure: true,
          maxAge: 15 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .send({
          success: true,
          message: "User loggedIn sucessfully",
          user: user,
        });
    } else {
      res.status(401).send({ success: false, message: "Invalid Password" });
    }
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
};

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    let isEmailExists = await User.findOne({ email });
    if (isEmailExists) {
      return res.status(409).send({
        success: false,
        message: `User already exists with the given "email"`,
      });
    }

    let hashedPassword = await hashPassword(password);
    let newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    let token = generateJWTToken(newUser._id);
    res
      .cookie("trial", token, {
        sameSite: "none",
        httpOnly: true,
        secure: true,
        maxAge: 15 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .send({ success: true, message: "User Registered Successfully", user });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
};

export const authenticateUser = async (req, res, next) => {
  let user_id = req.user_id;
  try {
    let user = await User.findOne({ _id: user_id });
    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "Invalid Token! No User Found" });
    res
      .status(200)
      .send({ success: true, message: "User is logged in", user: user });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("trial");
    res
      .status(200)
      .send({ success: true, message: "User logout successfully" });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
};
