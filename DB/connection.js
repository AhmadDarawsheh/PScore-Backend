import mongoose from "mongoose";

const connectDB = async () => {
  return await mongoose
    .connect('mongodb+srv://mydb:mydb@cluster0.nrkkjxs.mongodb.net/PScore?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
      console.log(`connectDB`);
    })
    .catch((err) => {
      console.log(`error connectiong to db ${err}`);
    });
};

export default connectDB;
