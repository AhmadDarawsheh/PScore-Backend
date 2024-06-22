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
      "location.coordinates": playground.location.coordinates,
      date,
      startTime,
      endTime,
    });

    if (conflict) {
      return res.json({
        message: "A match is already scheduled at this time and location",
      });
    }
    const playgroundPlace = playground.name;
    const match = await matchModel.create({
      owner: req.id,
      date,
      time,
      location: playground.location,
      status: "empty",
    });

    return res.json({
      message: "Match created successfully!",
      match,
      playgroundPlace,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getEmptyMatch = async (req, res) => {
  try {
    const { date } = req.body;
    const { playgroundId } = req.params;

    const playground = await playgroundModel.findById(playgroundId);

    if (!playground) return res.json({ message: "Playground not found!" });

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setUTCDate(startDate.getUTCDate() + 1);

    const match = await matchModel.find({
      owner: playground.owner,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      status: "empty",
    });

    if (!match) return res.json({ message: "No availabe matches." });

    return res.json({ message: "success", match });
  } catch (err) {
    console.log(err);
  }
};
