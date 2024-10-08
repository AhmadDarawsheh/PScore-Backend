import matchModel from "../../../DB/match.model.js";
import playgroundModel from "../../../DB/playground.model.js";
import profileModel from "../../../DB/profile.model.js";
import reportModel from "../../../DB/report.model.js";
import teamModel from "../../../DB/team.model.js";
import { getIo } from "../socket.js";

export const createMatch = async (req, res) => {
  try {
    if (!req.type === "owner")
      return res.json({ message: "You are not eligible to create a match!" });
    const { date, startTime, endTime } = req.body;
    const playground = await playgroundModel.findOne({ owner: req.id });

    if (!playground) return res.json({ message: "Playground not found!" });
    const conflict = await matchModel.findOne({
      date,
      startTime,
      endTime,
    });

    if (conflict) {
      return res.json({
        message: "A match is already scheduled at this time and location",
      });
    }

    const match = await matchModel.create({
      owner: req.id,
      date,
      startTime,
      endTime,
      playground: playground._id,
      playgroundName: playground.name,
      status: "empty",
    });

    return res.json({
      message: "Match created successfully!",
      match,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getEmptyMatch = async (req, res) => {
  try {
    const { playgroundId, date } = req.params;

    const playground = await playgroundModel.findById(playgroundId);

    if (!playground) return res.json({ message: "Playground not found!" });

    const match = await matchModel
      .find({
        owner: playground.owner,
        date,
        status: "empty",
      })
      .select("_id startTime endTime");

    if (!match) return res.json({ message: "No availabe matches." });

    return res.json({ message: "success", match });
  } catch (err) {
    console.log(err);
  }
};

export const getMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await matchModel
      .findById(matchId)
      .populate("team1", "name image recentResults")
      .populate("team2", "name image recentResults");

    if (!match) return res.json({ message: "Match not found!" });

    return res.json({ message: "Match found : ", match });
  } catch (err) {
    console.log(err);
  }
};

export const getTimedMatch = async (req, res) => {
  try {
    const { date } = req.params;

    const matches = await matchModel
      .find({
        date,
        status: { $in: ["timed", "live", "ended"] },
      })
      .populate("team1")
      .populate("team2")
      .populate("playground", "name");

    if (!matches.length) return res.json({ message: "No available matches." });

    // Group matches by playground
    const playgroundMatchesMap = new Map();

    matches.forEach((match) => {
      const playgroundId = match.playground._id.toString();
      if (!playgroundMatchesMap.has(playgroundId)) {
        playgroundMatchesMap.set(playgroundId, {
          playgroundName: match.playground.name,
          id: playgroundId,
          matches: [],
        });
      }

      const matchInfo = {
        id: match._id,
        startTime: match.startTime,
        endTime: match.endTime,
        team1: {
          teamName: match.team1 ? match.team1.name : "No team",
          teamimage: match.team1 ? match.team1.image : "",
        },
        team2: {
          teamName: match.team2 ? match.team2.name : "No team",
          teamimage: match.team2 ? match.team2.image : "",
        },
        status: match.status,
      };

      if (match.status === "live" || match.status === "ended") {
        matchInfo.team1Score = match.team1Score || 0;
        matchInfo.team2Score = match.team2Score || 0;
      }

      playgroundMatchesMap.get(playgroundId).matches.push(matchInfo);
    });

    const result = Array.from(playgroundMatchesMap.values()).sort((a, b) =>
      a.playgroundName.localeCompare(b.playgroundName)
    );

    return res.json({ message: "success", data: result });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Server error" });
  }
};

const updateMatchStatus = async (match) => {
  const now = new Date();
  const io = getIo();

  try {
    // Get current time in ISO 8601 format
    const currentISOTime = now.toISOString();

    // Construct complete datetime strings for start and end times
    const matchStartDateTime = new Date(
      `${match.date}T${match.startTime}`
    ).toISOString();
    const matchEndDateTime = new Date(
      `${match.date}T${match.endTime}`
    ).toISOString();

    if (
      matchStartDateTime <= currentISOTime &&
      currentISOTime < matchEndDateTime &&
      match.status !== "live"
    ) {
      match.status = "live";
      await match.save();
    } else if (currentISOTime >= matchEndDateTime && match.status !== "ended") {
      match.status = "ended";
      await match.save();
    } else {
      io.emit("matchStatusUpdate", match);
      console.log("Match status unchanged");
    }
  } catch (err) {
    console.error(`Error updating match status for match ${match._id}:`, err);
  }
};

export const addMatchEvents = async (req, res) => {
  try {
    if (!req.type === "user")
      return res.json({ message: "You are not eligible to add events!" });

    console.log(req.type);
    const { matchId } = req.params;
    const { event } = req.body;
    const match = await matchModel.findById(matchId);

    if (!match) return res.json({ message: "Match not found!" });

    console.log(event);

    const report = await reportModel.create({
      match: matchId,
      fan: req.id,
      goaler: event.goalId,
      assister: event.assistId,
      time: event.time,
      team: event.team,
    });

    const reportsCount = await reportModel.aggregate([
      {
        $group: {
          _id: {
            goaler: "$goaler",
            assister: "$assister",
            match: "$match",
            team: "$team",
          },
          distinctFans: { $addToSet: "$fan" },
          earliestTime: { $min: "$time" }, // Use $min to get earliest time based on 'time' attribute
        },
      },
      {
        $project: {
          goaler: "$_id.goaler",
          assister: "$_id.assister",
          match: "$_id.match",
          team: "$_id.team",
          reportCount: { $size: "$distinctFans" },
          earliestTime: 1, // Include earliestTime in the projection
        },
      },
    ]);

    const fanProfile = await profileModel.findOne({ user: req.id });

    if (!fanProfile)
      return res.json({ message: "You are not eligble to add an event" });

    if (fanProfile.trustLevel >= 100) {
      event.time = reportsCount[0].earliestTime;
      match.events.push(event);

      if (event.team === "team1") {
        match.team1Score++;
        const goalId = event.goalId;
        const assistId = event.assistId;
        const playerGolaer = match.team1Players.find((player) =>
          player.playerId.equals(goalId)
        );
        const goalerProfile = await profileModel.findOne({ user: goalId });
        goalerProfile.goals++;
        playerGolaer.goals++;

        const playerAssister = match.team1Players.find((player) =>
          player.playerId.equals(assistId)
        );
        const assisterProfile = await profileModel.findOne({
          user: assistId,
        });
        assisterProfile.assists++;
        playerAssister.assists++;

        await goalerProfile.save();
        await assisterProfile.save();
      }

      if (event.team === "team2") {
        match.team2Score++;
        const goalId = event.goalId;
        const assistId = event.assistId;
        const playerGolaer = match.team2Players.find((player) =>
          player.playerId.equals(goalId)
        );
        const goalerProfile = await profileModel.findOne({ user: goalId });
        goalerProfile.goals++;
        playerGolaer.goals++;

        const playerAssister = match.team2Players.find((player) =>
          player.playerId.equals(assistId)
        );
        const assisterProfile = await profileModel.findOne({
          user: assistId,
        });
        assisterProfile.assists++;
        playerAssister.assists++;

        await goalerProfile.save();
        await assisterProfile.save();
      }

      await match.save();

      const reportCountsAgg = await reportModel.aggregate([
        {
          $group: {
            _id: {
              goaler: "$goaler",
              assister: "$assister",
              match: "$match",
              team: "$team",
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            goaler: "$_id.goaler",
            assister: "$_id.assister",
            match: "$_id.match",
            team: "$_id.team",
            count: 1,
          },
        },
      ]);

      const deleteResult = await reportModel.deleteMany({
        $or: reportCountsAgg.map((report) => ({
          goaler: report.goaler,
          assister: report.assister,
          match: report.match,
          team: report.team,
        })),
      });

      fanProfile.trustLevel += 10;
    } else if (reportsCount[0].reportCount >= 3) {
      event.time = reportsCount[0].earliestTime;
      match.events.push(event);

      if (event.team === "team1") {
        match.team1Score++;
        const goalId = event.goalId;
        const assistId = event.assistId;
        const playerGolaer = match.team1Players.find((player) =>
          player.playerId.equals(goalId)
        );
        const goalerProfile = await profileModel.findOne({ user: goalId });
        goalerProfile.goals++;
        playerGolaer.goals++;

        const playerAssister = match.team1Players.find((player) =>
          player.playerId.equals(assistId)
        );
        const assisterProfile = await profileModel.findOne({
          user: assistId,
        });
        assisterProfile.assists++;
        playerAssister.assists++;

        await goalerProfile.save();
        await assisterProfile.save();
      }

      if (event.team === "team2") {
        match.team2Score++;
        const goalId = event.goalId;
        const assistId = event.assistId;
        const playerGolaer = match.team2Players.find((player) =>
          player.playerId.equals(goalId)
        );
        const goalerProfile = await profileModel.findOne({ user: goalId });
        goalerProfile.goals++;
        playerGolaer.goals++;

        const playerAssister = match.team2Players.find((player) =>
          player.playerId.equals(assistId)
        );
        const assisterProfile = await profileModel.findOne({
          user: assistId,
        });
        assisterProfile.assists++;
        playerAssister.assists++;

        await goalerProfile.save();
        await assisterProfile.save();
      }

      await match.save();

      const reportCountsAgg = await reportModel.aggregate([
        {
          $group: {
            _id: {
              goaler: "$goaler",
              assister: "$assister",
              match: "$match",
              team: "$team",
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            goaler: "$_id.goaler",
            assister: "$_id.assister",
            match: "$_id.match",
            team: "$_id.team",
            count: 1,
          },
        },
      ]);

      const uniqueFans = await reportModel.distinct("fan", {
        goaler: event.goalId,
        assister: event.assistId,
        match: match._id,
        team: event.team,
      });

      // Update trustLevel for each unique fan
      await profileModel.updateMany(
        { user: { $in: uniqueFans } },
        { $inc: { trustLevel: 10 } }
      );

      const deleteResult = await reportModel.deleteMany({
        $or: reportCountsAgg.map((report) => ({
          goaler: report.goaler,
          assister: report.assister,
          match: report.match,
          team: report.team,
        })),
      });
    }

    return res.json({ message: "Event Added Successfully!", match });
  } catch (err) {
    console.log(err);
  }
};

export const getMatchByOwnerId = async (req, res) => {
  try {
    if (req.type !== "owner")
      return res.json({ message: "you are not an owner" });

    const playground = await playgroundModel.findOne({ owner: req.id });

    if (!playground) return res.json({ message: "Playground not found!" });

    const match = await matchModel
      .find({
        owner: playground.owner,
        status: "empty",
      })
      .select("_id startTime endTime date status")
      .sort({ date: 1 });

    if (!match) return res.json({ message: "No availabe matches." });
    let plname = playground.name;
    return res.json({ message: "success", plname, match });
  } catch (err) {
    console.log(err);
  }
};

export const getMatchByOwnerIdPending = async (req, res) => {
  try {
    if (req.type !== "owner")
      return res.json({ message: "you are not an owner" });

    const playground = await playgroundModel.findOne({ owner: req.id });

    if (!playground) return res.json({ message: "Playground not found!" });

    const match = await matchModel
      .find({
        owner: playground.owner,
        status: "pending",
      })
      .select("_id startTime endTime date status team1")
      .sort({ date: 1 });

    if (match.length === 0) {
      return res.json({ message: "No available matches." });
    }

    const matchDetails = await Promise.all(
      match.map(async (match) => {
        const team = await teamModel.findById(match.team1);
        if (!team) {
          return { message: "Team not found" };
        }

        const managerProfile = await profileModel
          .findOne({
            user: team.manager,
          })
          .select("-_id userName number");
        if (!managerProfile) {
          return { message: "Manager not found" };
        }

        return {
          match,
          managerProfile,
        };
      })
    );
    const plname = playground.name;

    return res.json({ message: "success", plname, matchDetails });
  } catch (err) {
    console.log(err);
  }
};
