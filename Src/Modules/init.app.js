import authRouter from "./Auth/Auth.router.js";
import connectDB from "../../DB/connection.js";
import profileRouter from "./Profile/Profile.router.js";
import teamRouter from './Team/Team.router.js'
import cors from "cors"

const initApp = (app, express) => {
  app.use(cors());
  app.use(express.json());
  connectDB();
  app.use("/auth", authRouter);
  app.use("/profile",profileRouter);
  app.use("/team",teamRouter);
  app.use("/", (req, res) => {
    return res.json({ message: "Welcome to home page" });
  });
  app.use("*", (req, res) => {
    return res.json({ message: "Page not found" });
  });
};

export default initApp;
