import profileModel from "../../../DB/profile.model.js";

export const createProfile = async (req, res) => {
  try {
    const { number, position, country } = req.body;

    // const profile = await profileModel.findOne({ user: req.id });
    const profile = await profileModel
      .findOne({ user: req.id })
      .populate("user", "userType userName");

    // if (!req.fileUrl) {
    //   return res.status(400).json({ message: "No file uploaded." });
    // }
    const { user } = profile;
    let profileUpdate = {};
    const image = req.fileUrl;
    if (profile) {
      if (user.userType === "player") {
        profileUpdate = await profileModel.findOneAndUpdate(
          { user: req.id },
          { userName : user.userName ,number, position,country, image },
          { new: true }
        );
      } else {
        profileUpdate = await profileModel.findOneAndUpdate(
          { user: req.id },
          { userName : user.userName ,number, country, image },
          { new: true }
        );
      }

      return res.json({
        message: "You have updated your profile info successfully!",
        profileUpdate,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await profileModel
      .findOne({ user: req.id })
      .populate("user", "userName email");

    const {
      user,
      number = "N/A",
      position = "N/A",
      country = "N/A",
      image = "",
    } = profile;
    const userName = user.userName;
    const email = user.email;
    const userType = user.userType

    if (user.userType === "player") {
      return res.json({ userName, email, userType,number, position, country, image });
    } else {
      return res.json({ userName, email, userType,number, country, image });
    }
  } catch (err) {
    console.error(err);
  }
};
