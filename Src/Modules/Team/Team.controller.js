import teamModel from "../../../DB/team.model.js";
import userModel from "./../../../DB/user.model.js";
import profileModel from "./../../../DB/profile.model.js";
import matchModel from "./../../../DB/match.model.js";
import invitationModel from "../../../DB/invitation.model.js";
import playerInvitationModel from "../../../DB/playerInvitation.model.js";

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
    if (req.type === "manager") {
      const teamManager = await teamModel.findOne({ manager: req.id });
      if (!teamManager)
        return res.json({ message: "You are not the manager to this team!" });
      const { playerId } = req.params;

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
        team: playerProfile.team,
      };

      const existingPlayerAny = await teamModel.findOne({
        players: { $in: [playerId] },
      });
      if (existingPlayerAny) {
        return res.json({ message: "Player is already in a team" });
      }

      const existingPlayer = await teamModel.findOne({
        manager: req.id,
        players: { $in: [playerId] },
      });

      if (existingPlayer) {
        return res.json({
          message: "Player is already in the team.",
        });
      }

      console.log("Hi there");

      const message = `You are invited to join ${teamManager.name} team `;
      const playerInvite = await playerInvitationModel.create({
        sender: req.id,
        reciver: playerId,
        message,
        image: teamManager.image,
      });

      return res.json({
        message: "Player is invited to your team!",
        playerInvite,
        mergedPlayer,
      });
    } else {
      return res.json({ message: "You are not eligible to add a player!" });
    }
  } catch (err) {}
};

export const getPlayerInvite = async (req, res) => {
  try {
    if (req.type !== "player")
      return res.json({ message: "You are not a player!" });
    const invites = await playerInvitationModel.find({ reciver: req.id });

    if (!invites) return res.json({ message: "No invitations availabe!" });

    return res.json({ message: "Your invitations: ", invites });
  } catch (err) {
    console.log(err);
  }
};

export const playerResponse = async (req, res) => {
  try {
    const { response, inviteId } = req.body;
    if (req.type !== "player")
      return res.json({ message: "You are not a player!" });

    const playerInvite = await playerInvitationModel.findOne({
      reciver: req.id,
    });

    const playerProfile = await profileModel.find({
      user: req.id,
    });

    if (response === "accepted") {
      const team = await teamModel
        .findOneAndUpdate(
          {
            manager: playerInvite.sender,
          },
          { $push: { players: req.id } },
          { new: true }
        )
        .populate("manager", "userName")
        .populate("players", "userName")
        .select("name manager players");

      const addTeam = await profileModel.findOneAndUpdate(
        { user: req.id },
        { team: team.name },
        { new: true }
      );

      const message = `You invited has been accepted`;
      const playerResponse = await playerInvitationModel.create({
        sender: req.id,
        reciver: playerInvite.sender,
        message,
        image: playerProfile.image,
      });

      const deleteInvite = await playerInvitationModel.findByIdAndDelete(
        inviteId
      );
    } else if (response === "rejected") {
      const message = `You invited has been rejected`;
      const playerResponse = await playerInvitationModel.create({
        sender: req.id,
        reciver: playerInvite.sender,
        message,
        image: playerProfile.image,
      });

      const deleteInvite = await playerInvitationModel.findByIdAndDelete(
        inviteId
      );
    } else {
      return res.json({ message: "Invalid response" });
    }

    return res.json({ message: `Invitation ${response}` });
  } catch (err) {
    console.log(err);
  }
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

export const getTeamDetailsById = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await teamModel
      .findById(teamId)
      .populate("manager", "userType userName")
      .populate("players", "userName")
      .select("-players");

    if (!team) return res.json({ message: "No team" });

    const myMatches = await matchModel
      .find({
        status: { $ne: "pending" },
        $or: [{ team1: team._id }, { team2: team._id }],
      })
      .select("team1 team2 team1Score team2Score startTime endTime status date")
      .populate("team1", "-_id name image")
      .populate("team2", "-_id name image")
      .sort({ date: 1 });

    if (!myMatches) return res.json({ message: "No available matches!" });

    const playerIds = team.players.map((p) => p._id);

    const playersProfiles = await profileModel
      .find({
        user: { $in: playerIds },
      })
      .populate("user", "userName userType email")
      .select("-_id user position image");

    const playerProfile = playersProfiles.map((profile) => ({
      _id: profile.user._id,
      userName: profile.user.userName,
      email: profile.user.email,
      userType: profile.user.userType,
      position: profile.position,
      image: profile.image,
    }));

    return res.json({ team, playerProfile, myMatches });
  } catch (err) {
    console.log(err);
  }
};

export const removePlayer = async (req, res) => {
  try {
    console.log(req.type);
    if (req.type === "manager") {
      const teamManager = await teamModel.findOne({ manager: req.id });
      if (!teamManager)
        return res.json({ message: "You are not the manager to this team!" });
      const { playerId } = req.params;

      const existingPlayer = await teamModel.findOne({
        manager: req.id,
        players: { $in: [playerId] },
      });

      if (!existingPlayer) {
        return res.json({
          message: "Player not found in the team.",
        });
      }

      const team = await teamModel.findOneAndUpdate(
        {
          manager: req.id,
        },
        { $pull: { players: playerId } },
        { new: true }
      );
      const playerProfile = await profileModel.findOneAndUpdate(
        { user: playerId },
        { team: "No Team" },
        { new: true }
      );
      return res.json({
        message: "Player is removed from the team successfully!",
        team,
        playerProfile,
      });
    } else {
      return res.json({ message: "You are not eligible to add a player!" });
    }
  } catch (err) {}
};

//methods for adding teams to a match .

// export const addMyTeam = async (req, res) => {
//   try {
//     const { matchId } = req.params;
//     const { others, ...playersObj } = req.body;

//     if (req.type !== "manager")
//       return res.json({ message: "You are not a manager!" });

//     const team = await teamModel.findOne({ manager: req.id });

//     if (!team) {
//       return res.json({ message: "Team not found" });
//     }

//     const match = await matchModel.findById(matchId);

//     if (!match) {
//       return res.json({ message: "Match not found" });
//     }

//     const players = Object.values(playersObj).map((player) => ({
//       playerId: player.id,
//       name: player.playername,
//       photo: player.image,
//     }));

//     const othersArray = others.map((item) => ({
//       playerId: item.id,
//       name: item.playername,
//       photo: item.image,
//     }));

//     match.team1 = team._id;
//     match.team1Players = players;
//     match.team1others = othersArray;
//     match.status = "pending";

//     await match.save();

//     return res.json({ message: "Team added to match", match });
//   } catch (err) {
//     console.log(err);
//   }
// };

export const searchTeam = async (req, res) => {
  try {
    console.log(req.type);
    if (req.type !== "manager")
      return res.json({ message: "You cannot search for teams" });
    const { teamName } = req.query;

    const team = await teamModel
      .find({
        name: { $regex: teamName, $options: "i" },
      })
      .select("_id name image ");

    if (team.length === 0) {
      return res.json({ message: "No teams found" });
    }

    return res.json({ message: "Teams found", team });
  } catch (err) {
    console.log(err);
  }
};

export const getTeamById = async (req, res) => {
  // this function to build the team and send an invite
  try {
    if (req.type !== "manager")
      return res.json({ message: "You are not a manager" });
    const { others, ...playersObj } = req.body;
    const { matchId } = req.params;
    const { teamId } = req.params;

    const team = await teamModel.findOne({ manager: req.id });

    if (!team) {
      return res.json({ message: "Manager's team not found" });
    }

    if (team._id.equals(teamId)) {
      return res.json({ message: "You cannot invite your own team" });
    }

    const currentMatch = await matchModel.findById(matchId);
    const players = Object.values(playersObj).map((player) => ({
      playerId: player.id,
      name: player.playername,
      photo: player.image,
    }));

    const othersArray = others.map((item) => ({
      playerId: item.id,
      name: item.playername,
      photo: item.image,
    }));

    currentMatch.team1 = team._id;
    currentMatch.team1Players = players;
    currentMatch.team1others = othersArray;
    currentMatch.status = "pending";

    const invitedTeam = await teamModel.findById(teamId);
    if (!invitedTeam) {
      return res.json({ message: "Invited team not found" });
    }
    if (currentMatch.team2 && !currentMatch.team2.equals(invitedTeam._id)) {
      return res.json({ message: "Another team is already invited" });
    }

    if (
      currentMatch.invitedTeam &&
      currentMatch.invitedTeam.equals(invitedTeam._id)
    )
      return res.json({ message: "Team already invited" });

    currentMatch.invitedTeam = invitedTeam._id;
    currentMatch.invitedTeamResponse = "pending";

    const inviteMessage = `${team.name} invited you to a match`;

    const invite = await invitationModel.create({
      sender: team.manager,
      reciver: invitedTeam.manager,
      match: currentMatch._id,
      message: inviteMessage,
      image: team.image,
    });

    currentMatch.invitationExpiration = new Date(
      Date.now() + 4 * 60 * 60 * 1000
    );
    currentMatch.invitationStatus = "pending";

    await currentMatch.save();

    return res.json({ message: "Team invited to match", currentMatch, invite });
  } catch (err) {
    console.log(err);
  }
};

export const getInvite = async (req, res) => {
  try {
    if (req.type !== "manager")
      return res.json({ message: "You are not a manager!" });
    const invites = await invitationModel.find({ reciver: req.id });
    const playerInvites = await playerInvitationModel.find({ reciver: req.id });
    const allInvites = invites.concat(playerInvites);

    if (!allInvites) return res.json({ message: "No invitations availabe!" });

    return res.json({ message: "Your invitations: ", allInvites });
  } catch (err) {
    console.log(err);
  }
};

export const inviteResponse = async (req, res) => {
  try {
    if (req.type !== "manager")
      return res.json({ message: "You are not a manager" });
    const { matchId } = req.params;
    const { response, inviteId, others, ...playersObj } = req.body;

    const currentMatch = await matchModel.findById(matchId);

    if (!currentMatch) return res.json({ message: "Match not found!" });
    const invitedTeam = await teamModel.findOne({ manager: req.id });
    const invitedByTeam = await teamModel.findById(currentMatch.team1);

    if (
      !invitedTeam ||
      !currentMatch.invitedTeam ||
      !currentMatch.invitedTeam.equals(invitedTeam._id)
    ) {
      return res.json({ message: "Unauthorized or team not invited" });
    }

    if (response === "accepted") {
      const players = Object.values(playersObj).map((player) => ({
        playerId: player.id,
        name: player.playername,
        photo: player.image,
      }));

      const othersArray = others.map((item) => ({
        playerId: item.id,
        name: item.playername,
        photo: item.image,
      }));

      currentMatch.invitedTeamResponse = "accepted";
      currentMatch.team2 = invitedTeam._id;
      currentMatch.team2Players = players;
      currentMatch.team2others = othersArray;
      currentMatch.status = "timed";
      currentMatch.invitationStatus = "accepted";
      currentMatch.invitationExpiration = null;

      const notify = await invitationModel.create({
        match: currentMatch._id,
        reciver: invitedByTeam.manager,
        sender: invitedTeam._id,
        message: `Your invite to ${invitedTeam.name} has been accepted!`,
        image: invitedTeam.image,
      });

      const invite = await invitationModel.findByIdAndDelete(inviteId);
    } else if (response === "rejected") {
      currentMatch.invitedTeamResponse = "rejected";
      currentMatch.invitedTeam = null;
      currentMatch.team2 = null;
      currentMatch.team1 = null;
      currentMatch.team1Players = [];
      currentMatch.team1others = [];
      currentMatch.team2Players = [];
      currentMatch.team2others = [];
      currentMatch.status = "empty";
      currentMatch.invitationExpiration = null;
      currentMatch.invitationStatus = "expired";

      currentMatch.invitedTeamResponse = "pending";

      const notify = await invitationModel.create({
        reciver: invitedByTeam.manager,
        sender: invitedTeam._id,
        message: `Your invite to ${invitedTeam.name} has been rejected!`,
        image: invitedTeam.image,
        match: matchId,
      });

      const invite = await invitationModel.findByIdAndDelete(inviteId);
    } else {
      return res.json({ message: "Invalid response" });
    }

    await currentMatch.save();

    res.json({ message: `Invitation ${response}`, currentMatch });
  } catch (err) {
    console.log(err);
  }
};

export const getTeamMatches = async (req, res) => {
  //myGames
  try {
    if (req.type !== "manager")
      return res.json({ message: "You are not a manager" });

    const team = await teamModel.findOne({ manager: req.id });

    if (!team) return res.json({ message: "You don't have a team" });

    const myMatches = await matchModel
      .find({
        $or: [{ team1: team._id }, { team2: team._id }],
      })
      .select(
        "team1 team2 team1Score team2Score startTime endTime status date invitedTeam"
      )
      .populate("team1", "-_id name image")
      .populate("team2", "-_id name image")
      .populate("invitedTeam", "-_id name image")
      .sort({ date: 1 });

    if (!myMatches) return res.json({ message: "No available matches!" });

    return res.json({ message: "You matches : ", myMatches });
  } catch (err) {
    console.log(err);
  }
};

// export const getTeamMatchesById = async (req, res) => {
//   try {
//     const { teamId } = req.params;

//     const team = await teamModel.findById(teamId);

//     if (!team) return res.json({ message: "You don't have a team" });

//     const myMatches = await matchModel
//       .find({
//         $or: [{ team1: team._id }, { team2: team._id }],
//       })
//       .select("team1 team2 team1Score team2Score startTime endTime status")
//       .populate("team1", "-_id name image")
//       .populate("team2", "-_id name image");

//     if (!myMatches) return res.json({ message: "No available matches!" });

//     return res.json({ message: "You matches : ", myMatches });
//   } catch (err) {
//     console.log(err);
//   }
// };

export const dropDownTeams = async (req, res) => {
  try {
    const teams = await teamModel.find().select("_id name image");
    if (!teams) return res.json({ message: "No teams found!" });

    return res.json({ message: "teams : ", teams });
  } catch (err) {}
};
