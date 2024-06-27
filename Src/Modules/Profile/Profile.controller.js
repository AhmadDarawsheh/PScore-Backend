import matchModel from "../../../DB/match.model.js";
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
          team = "No Team";
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
    let playerMatches;
    let matchesNumber;
    if (playerId) {
      profile = await profileModel
        .findOne({ user: playerId })
        .populate("user", "userName email userType birthDate");

      playerMatches = await matchModel
        .find({
          $or: [
            { team1Players: { $elemMatch: { playerId } } },
            { team2Players: { $elemMatch: { playerId } } },
            { team1others: { $elemMatch: { playerId } } },
            { team2others: { $elemMatch: { playerId } } },
          ],
          status: { $ne: "pending" },
        })
        .select(
          "team1 team2 team1Score team2Score startTime endTime status date"
        )
        .populate("team1", "-_id name image")
        .populate("team2", "-_id name image")
        .sort({ date: 1 });
      matchesNumber = await matchModel
        .find({
          status: "ended",
          $or: [
            { team1Players: { $elemMatch: { playerId } } },
            { team2Players: { $elemMatch: { playerId } } },
            { team1others: { $elemMatch: { playerId } } },
            { team2others: { $elemMatch: { playerId } } },
          ],
        })
        .select(
          "team1 team2 team1Score team2Score startTime endTime status date"
        )
        .populate("team1", "-_id name image")
        .populate("team2", "-_id name image")
        .sort({ date: 1 });
    } else {
      profile = await profileModel
        .findOne({ user: req.id })
        .populate("user", "userName email userType birthDate");
    }

    if (req.type === "player") {
      playerMatches = await matchModel
        .find({
          $or: [
            { team1Players: { $elemMatch: { playerId: req.id } } },
            { team2Players: { $elemMatch: { playerId: req.id } } },
            { team1others: { $elemMatch: { playerId: req.id } } },
            { team2others: { $elemMatch: { playerId: req.id } } },
          ],
          status: { $ne: "pending" },
        })
        .select(
          "team1 team2 team1Score team2Score startTime endTime status date"
        )
        .populate("team1", "-_id name image")
        .populate("team2", "-_id name image")
        .sort({ date: 1 });

      matchesNumber = await matchModel.find({
        status: "ended",
        $or: [
          { team1Players: { $elemMatch: { playerId: req.id } } },
          { team2Players: { $elemMatch: { playerId: req.id } } },
          { team1others: { $elemMatch: { playerId: req.id } } },
          { team2others: { $elemMatch: { playerId: req.id } } },
        ],
      });
    }

    let teamManagerMatches;
    if (req.type === "manager") {
      const managerTeam = await teamModel.findOne({ manager: req.id });
      if (!managerTeam) return res.json({ message: "Your team not found" });
      teamManagerMatches = await matchModel.find({
        $or: [{ team1: managerTeam._id }, { team2: managerTeam._id }],
      });
    }

    const {
      user,
      number = "N/A",
      position = "N/A",
      country = "N/A",
      image = "",
      team = "",
      goals = 0,
      assists = 0,
    } = profile;
    const userName = user.userName;
    const email = user.email;
    const userType = user.userType;
    const birthdate = user.birthDate;
    const numberOfEndedMatches = matchesNumber.length;

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
        goals,
        assists,
        numberOfEndedMatches,
        playerMatches,
      });
    } else if (user.userType === "manager") {
      return res.json({
        userName,
        email,
        userType,
        number,
        country,
        age,
        image,
        teamManagerMatches,
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
