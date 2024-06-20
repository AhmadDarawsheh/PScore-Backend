import profileModel from "../../../DB/profile.model.js";
import teamModel from "../../../DB/team.model.js";

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
        const existingPlayer = await teamModel.findOne({
          players: { $in: [req.id] },
        });
        let team;
        if (existingPlayer) {
          team = existingPlayer.name;
        } else {
          team = "No team";
        }

        profileUpdate = await profileModel.findOneAndUpdate(
          { user: req.id },
          { userName: user.userName, number, position, country, image, team },
          { new: true }
        );
      } else {
        profileUpdate = await profileModel.findOneAndUpdate(
          { user: req.id },
          { userName: user.userName, number, country, image },
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
    const { playerId } = req.params;
    let profile;
    if (playerId) {
      profile = await profileModel
        .findOne({ user: playerId })
        .populate("user", "userName email userType birthDate");
    } else {
      profile = await profileModel
        .findOne({ user: req.id })
        .populate("user", "userName email userType birthDate");
    }
    const {
      user,
      number = "N/A",
      position = "N/A",
      country = "N/A",
      image = "",
      team = "",
    } = profile;
    const userName = user.userName;
    const email = user.email;
    const userType = user.userType;
    const birthdate = user.birthDate;

    const age = calculateAge(birthdate);
    // return in playerprofile the team id image
    if (user.userType === "player") {
      return res.json({
        userName,
        email,
        userType,
        number,
        position,
        country,
        age,
        image,
        team,
      });
    } else {
      return res.json({
        userName,
        email,
        userType,
        number,
        country,
        age,
        image,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

const calculateAge = (birthdate) => {
  const today = new Date();

  let age = today.getFullYear() - birthdate.getFullYear();

  return age;
};
