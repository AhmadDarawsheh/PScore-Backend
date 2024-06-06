import profileModel from "../../../DB/profile.model.js";

export const createProfile = async (req, res) => {
  try {
    const { number, position, country } = req.body;

    const profile = await profileModel.findOne({ user: req.id });

    if (profile) {
      const profileUpdate = await profileModel.findOneAndUpdate(
        { user: req.id },
        { number, position, country },
        { new: true }
      );

      return res.json({
        message: "You have updated your profile info successfully!",
        profileUpdate,
      });
    }

    const createProfile = await profileModel.create({
      user: req.id,
      number,
      position,
      country,
    });

    return res.json(createProfile);
  } catch (err) {
    console.log(err);
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await profileModel
      .findOne({ user: req.id })
      .populate("user", "userName");

    if (!profile) {
      return res.json({ message: "Please create your profile!" }); // to check if the user already has a profile(one profile allowed for user)
    }

    const { user, number, position, country } = profile;
    const userName = user.userName;

    res.json({ userName, number, position, country });
  } catch (err) {
    console.error(err);
  }
};

export const updateProfile = async (req, res) => {
  try {
  } catch (err) {}
};
