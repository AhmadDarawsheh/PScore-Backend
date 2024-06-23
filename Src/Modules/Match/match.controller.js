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
      startTime,
      endTime,
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

export const getMatch = async (req,res)=>{
  try {
    
  } catch (err) {
    console.log(err)
    
  }
}