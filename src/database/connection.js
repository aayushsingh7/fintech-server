import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Database Connected Successfully");
  } catch (err) {
    console.log({ message: "Error While Connecting To Database", err });
    throw err;
  }
};

export default connectToDB;
