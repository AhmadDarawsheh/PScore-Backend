import jwt, { decode } from "jsonwebtoken";
import userModel from "../../DB/user.model.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization?.startsWith(process.env.BEARERKEY)) {
      return res.json({ message: "Invalid authorization" });
    }

    const token = authorization.split(process.env.BEARERKEY)[1];

    if (!token) {
      return res.json({ message: "token is required" });
    }
    const decoded = jwt.verify(token, process.env.LOGINTOKEN);

    if (!decoded || !decoded.id) {
      return res
        .status(400)
        .json({ message: "Invalid authorization token payload" });
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    req.id = user._id;
    req.type = user.userType
    next();
  } catch (err) {
    return res.json({ message: "error occured", err });
  }
};
