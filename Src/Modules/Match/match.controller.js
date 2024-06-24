import matchModel from "../../../DB/match.model.js";
import playgroundModel from "../../../DB/playground.model.js";

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
    const match = await matchModel.findById(matchId);

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
        status: "timed",
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

      playgroundMatchesMap.get(playgroundId).matches.push({
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
      });
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
