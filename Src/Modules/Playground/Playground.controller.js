import userModel from "./../../../DB/user.model.js";
import playgroundModel from "./../../../DB/playground.model.js";
import ownerModel from "./../../../DB/owner.model.js";
import bcrypt from "bcryptjs";
import { signupValidation } from "./../Auth/Auth.validation.js";

export const addPlayground = async (req, res) => {
  try {
    const { playgroundName, location, ownerDetails } = req.body;
    const admin = await userModel.findById(req.id);
    if (!admin || admin.userType !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    // console.log(ownerDetails);
    const owner =
      typeof ownerDetails === "string"
        ? JSON.parse(ownerDetails)
        : ownerDetails;
    const { userName, email, password } = owner;

    const validationResult = signupValidation.validate(
      { userName, email, password },
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
    const hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SALTROUND)
    );

    const ownerUser = await userModel.create({
      userName,
      email,
      password: hashedPassword,
      userType: "owner",
    });

    // console.log(ownerUser);

    const ownerProfile = await ownerModel.create({
      user: ownerUser._id,
    });

    // console.log(ownerProfile);

    const [latitude, longitude] = location
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    const playgroundNameCheck = await playgroundModel.findOne({
      name: playgroundName,
    });

    if (playgroundNameCheck)
      return res.json({ message: "Playground already exists!" });

    const playground = await playgroundModel.create({
      name: playgroundName,
      photos: req.fileUrls,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      owner: ownerUser._id,
    });

    return res.json({
      message: "Playground created and owner registered successfully!",
      playground: playground,
      owner: ownerUser,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getPlayground = async (req, res) => {
  try {
    const playgrounds = await playgroundModel.find({});

    return res.json(playgrounds);
  } catch (err) {
    console.log(err);
  }
};

