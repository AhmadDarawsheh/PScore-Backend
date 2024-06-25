import cron from "node-cron";
import matchModel from "../../DB/match.model.js";
import { getIo } from "./socket.js"; // Import the io instance

const parseTime = (timeStr) => new Date(timeStr);

cron.schedule("*/10 * * * * *", async () => {
  try {
    console.log("hello from cron");
    const matches = await matchModel.find({
      status: { $in: ["timed", "live"] },
    });

    if (matches.length < 1) return console.log("No match found!");

    console.log(matches);
    const now = new Date();
    const io = getIo();

    for (const match of matches) {
      const currentISOTime = now.toISOString();
      console.log(match.status);

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
      } else if (
        currentISOTime >= matchEndDateTime &&
        match.status !== "ended"
      ) {
        match.status = "ended";
        await match.save();
      } else {
        console.log("Match status unchanged");
      }
    }
  } catch (err) {
    console.error("Error updating match status:", err);
  }
});
