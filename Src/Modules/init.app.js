import authRouter from "./Auth/Auth.router.js";
import connectDB from "../../DB/connection.js";

const initApp = (app, express) => {
  app.use(express.json());
  connectDB();
  app.use("/auth", authRouter);
  app.use("/", (req, res) => {
    return res.json({ message: "Welcome to home page" });
  });
  app.use("*", (req, res) => {
    return res.json({ message: "Page not found" });
  });
};

export default initApp;
