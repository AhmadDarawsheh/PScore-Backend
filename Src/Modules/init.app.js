import authRouter from "./Auth/Auth.router.js";
import connectDB from "../../DB/connection.js";
import profileRouter from "./Profile/Profile.router.js";
import teamRouter from "./Team/Team.router.js";
import playgroundRouter from "./Playground/Playground.router.js";
import matchRouter from "./Match/match.router.js";
import cors from "cors";

// import { initSocket } from "./socket.js";

const initApp = (app, express) => {
  app.use(cors({
    origin: "*",
  }));
  app.use(express.json());
  connectDB();
  app.use("/auth", authRouter);
  app.use("/profile", profileRouter);
  app.use("/team", teamRouter);
  app.use("/playground", playgroundRouter);
  app.use("/match", matchRouter);
  app.use("/", (req, res) => {
    return res.json({ message: "Welcome to home page" });
  });
  app.use("*", (req, res) => {
    return res.json({ message: "Page not found" });
  });

  // const io = initSocket(app);

  // return io;
};

export default initApp;
