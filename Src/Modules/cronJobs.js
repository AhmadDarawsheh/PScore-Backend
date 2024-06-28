import cron from "node-cron";
import matchModel from "../../DB/match.model.js";
import { getIo } from "./socket.js"; // Import the io instance
import teamModel from "../../DB/team.model.js";

const parseTime = (timeStr) => new Date(timeStr);

const updateRecentResults = async (teamId, result) => {
  const team = await teamModel.findById(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  team.recentResults.push(result);
  if (team.recentResults.length > 4) {
    team.recentResults.shift(); // Keep only the last 4 results
  }
  console.log("Hi there");
  await team.save();
};

cron.schedule("*/10 * * * * *", async () => {
  try {
    console.log("hello from cron");
    const matches = await matchModel.find({
      status: { $in: ["timed", "live", "ended"] },
    });

    if (matches.length < 1) return console.log("No match found!");

    // console.log(matches);
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
        console.log("Hi ther");
        match.status = "ended";

        await match.save();
      } else {
        console.log("Match status unchanged");
      }
      if (match.status === "ended") {
        const team1Result =
          match.team1Score > match.team2Score
            ? "W"
            : match.team1Score < match.team2Score
            ? "L"
            : "D";
        const team2Result =
          match.team1Score < match.team2Score
            ? "W"
            : match.team1Score > match.team2Score
            ? "L"
            : "D";

        await updateRecentResults(match.team1, team1Result);
        await updateRecentResults(match.team2, team2Result);
      }
    }
  } catch (err) {
    console.error("Error updating match status:", err);
  }
});

const checkForExpiredInvitations = async () => {
  const now = new Date();
  const expiredMatches = await matchModel.find({
    invitationExpiration: { $lte: now },
    invitationStatus: "pending",
  });

  for (const match of expiredMatches) {
    match.status = "empty";
    match.invitationStatus = "expired";
    match.invitedTeam = null;
    match.invitationExpiration = null;
    match.invitedTeamResponse = null;
    await match.save();
    console.log(match);
  }
};

cron.schedule("*/5 * * * *", () => {
  checkForExpiredInvitations();
});
