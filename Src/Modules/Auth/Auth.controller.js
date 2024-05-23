import userModel from "../../../DB/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signupValidation } from "./Auth.validation.js";

export const signup = async (req, res) => {
  try {
    const { userName, email, password, userType , age, } = req.body;
    const validationResult = signupValidation.validate(
      { userName, email, password, age },
      {
        abortEarly: false,
      }
    );

    if (validationResult.error) {
      const errors = validationResult.error.details.map(
        (error) => error.message
      );
      return res.json({ errors });
    }

    var hash = bcrypt.hashSync(password, parseInt(process.env.SALTROUND));

    // console.log({ userName, email, password, userType , age,});
    const user = await userModel.create({
      userName,
      email,
      password: hash,
      userType,
      age
    });

    //return res.json(hash);
    return res.json({ message: "success", user });
  } catch (err) {
    return res.json({ message: "An error has occured", err });
  }
};

export const generateToken = (userID) => {
  // console.log("Hi from GenerateToken function");
  const token = jwt.sign({ id: userID }, process.env.LOGINTOKEN, {
    expiresIn: 60 * 60,
  });
  return token;
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const login = await userModel.findOne({ email });
    // console.log(email);

    if (!login) {
      return res.json({ message: "invalid  email" });
    }

    const match = bcrypt.compareSync(password, login.password);

    if (!match) {
      return res.json({ message: "invalid password" });
    }
    const token = generateToken(login._id);
    // console.log("Suiii");

    return res.json({ message: "success", token });
  } catch (error) {
    return res.json({ message: "error catch", error });
  }
};
