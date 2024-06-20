import matchModel from "../../../DB/match.model.js";
import playgroundModel from "../../../DB/playground.model.js";

export const createMatch = async (req, res) => {
  try {
    if (!req.type === "owner")
      return res.json({ message: "You are not eligible to create a match!" });
    const { date, time } = req.body;
    const playground = await playgroundModel.findOne({ owner: req.id });

    if (!playground) return res.json({ message: "Playground not found!" });
    const conflict = await matchModel.findOne({
      "location.coordinates": playground.location.coordinates,
      date,
      time,
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
