import profileModel from "../../../DB/profile.model.js";

export const createProfile = async (req, res) => {
  try {
    const { number, position, country } = req.body;

    const profile = await profileModel.findOne({ user: req.id });

    if (profile)
      return res.status(400).json({
        message: "Profile already exists. You cannot create another profile.", //checking if use already has a profile
      });

    const createProfile = await profileModel.create({
      user: req.id,
      number,
      position,
      country,
    });

    res.json(createProfile);
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
