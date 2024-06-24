import matchModel from "../../../DB/match.model.js";
import playgroundModel from "../../../DB/playground.model.js";
// import { getIo } from "../socket.js";

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
      .populate("team1", "name image")
      .populate("team2", "name image");

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

      updateMatchStatus(match);

      const matchInfo = {
        id: match._id,
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

  // io.emit("hi", { messgae: "Hello from backend" });

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

    // Update match status based on current time and match datetime
    if (
      matchStartDateTime <= currentISOTime &&
      currentISOTime < matchEndDateTime &&
      match.status !== "live"
    ) {
      match.status = "live";
      await match.save();
      io.emit("matchStatusUpdate", { match });
    } else if (currentISOTime >= matchEndDateTime && match.status !== "ended") {
      match.status = "ended";
      await match.save();
      io.emit("matchStatusUpdate", { match });
    } else {
      console.log("Match status unchanged");
    }
  } catch (err) {
    console.error(`Error updating match status for match ${match._id}:`, err);
  }
};
