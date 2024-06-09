import profileModel from "../../../DB/profile.model.js";

export const createProfile = async (req, res) => {
  try {
    const { number, position, country } = req.body;

    const profile = await profileModel.findOne({ user: req.id });

    // if (!req.fileUrl) {
    //   return res.status(400).json({ message: "No file uploaded." });
    // }

    const image = req.fileUrl;
    if (profile) {
      const profileUpdate = await profileModel.findOneAndUpdate(
        { user: req.id },
        { number, position, country, image },
        { new: true }
      );

      return res.json({
        message: "You have updated your profile info successfully!",
        profileUpdate,
      });
    }

    return res.json(createProfile);
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

    res.json({ userName, email, number, position, country, image });
  } catch (err) {
    console.error(err);
  }
};
