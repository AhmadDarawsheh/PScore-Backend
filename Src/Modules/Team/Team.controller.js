import teamModel from "../../../DB/team.model.js";
import userModel from "./../../../DB/user.model.js";
import profileModel from "./../../../DB/profile.model.js";

export const createTeam = async (req, res) => {
  try {
    const { teamName } = req.body;
    const image = req.fileUrl;
    const checking = await teamModel.findOne({ name: teamName });
    const managerCheck = await teamModel.findOne({ manager: req.id });
    if (checking) return res.json({ message: "Team already exists" });
    if (managerCheck) {
      const team = await teamModel.findOneAndUpdate(
        { manager: req.id },
        { name: teamName, image }
      );

      return res.json({ message: "Team updated successfully!", team });
    }
    console.log(req.type);
    if (req.type === "manager") {
      const team = await teamModel.create({
        name: teamName,
        manager: req.id,
        players: [],
        image,
      });
      return res.json({ team });
    } else {
      return res.json({ message: "You are not eligible to create a team!" });
    }
  } catch (err) {
    console.log(err);
  }
};

export const searchPlayers = async (req, res) => {
  try {
    console.log(req.type);
    if (req.type === "manager") {
      const { name } = req.query;

      const players = await userModel
        .find({
          userType: "player",
          userName: { $regex: name, $options: "i" },
        })
        .select("_id userName userType email");

      if (players.length === 0) {
        return res.json({ message: "No players found" });
      }
      // Extract player IDs
      const playerIds = players.map((player) => player._id);

      // Find profiles by player IDs
      const playersProfiles = await profileModel
        .find({
          user: { $in: playerIds },
        })
        .select("user position image");

      // Merge players and profiles
      const allplayers = players.map((player) => {
        const profile = playersProfiles.find(
          (profile) => profile.user.toString() === player._id.toString()
        );
        const mergedPlayer = {
          user: player._id, // Using the _id as user field
          userName: player.userName,
          email: player.email,
          userType: player.userType,
          ...(profile ? profile.toObject() : {}),
        };
        delete mergedPlayer._id; // Remove the _id field
        return mergedPlayer;
      });

      return res.json({ message: "Players found", players: allplayers });
    } else {
      return res.json({
        message: "You are not eligible to search for players!",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const addPlayer = async (req, res) => {
  try {
    console.log(req.type);
    if (req.type === "manager") {
      const teamManager = await teamModel.findOne({ manager: req.id });
      if (!teamManager)
        return res.json({ message: "You are not the manager to this team!" });
      const { teamName, playerId } = req.params;

      const player = await userModel
        .findById(playerId)
        .select("userName userType email");
      if (player.userType !== "player")
        return res.json({
          message: "The user you are trying to add is not a player!",
        });

      const playerProfile = await profileModel
        .findOne({ user: playerId })
        .select("user position image");

      if (!playerProfile) {
        return res.status(404).json({ message: "Player profile not found" });
      }

      const mergedPlayer = {
        user: playerId, //
        userName: player.userName,
        email: player.email,
        userType: player.userType,
        position: playerProfile.position,
        image: playerProfile.image,
      };
      const existingPlayer = await teamModel.findOne({
        manager: req.id,
        players: { $in: [playerId] },
      });

      if (existingPlayer) {
        return res.json({
          message: "Player is already in the team.",
        });
      }
      const team = await teamModel
        .findOneAndUpdate(
          {
            manager: req.id,
          },
          { $push: { players: playerId } },
          { new: true }
        )
        .populate("manager", "userName")
        .populate("players", "userName")
        .select("name manager players");

      return res.json({
        message: "Player is added to team successfully!",
        team,
        mergedPlayer,
      });
    } else {
      return res.json({ message: "You are not eligible to add a player!" });
    }
  } catch (err) {}
};

export const getTeam = async (req, res) => {
  try {
    if (req.type !== "manager")
      return res.json({ message: "You are not a manager!" });
    const team = await teamModel
      .findOne({ manager: req.id })
      .populate("manager", "userType userName")
      .populate("players", "userName")
      .select("-players");

    if (!team) return res.json({ message: "No team" });

    const playerIds = team.players.map((p) => p._id);

    const playersProfiles = await profileModel
      .find({
        user: { $in: playerIds },
      })
      .populate("user", "userName userType email")
      .select("-_id user position image");

    console.log(playersProfiles);

    const playerProfile = playersProfiles.map((profile) => ({
      _id: profile.user._id,
      userName: profile.user.userName,
      email: profile.user.email,
      userType: profile.user.userType,
      position: profile.position,
      image: profile.image,
    }));

    return res.json({ team, playerProfile });
  } catch (err) {
    console.log(err);
  }
};
