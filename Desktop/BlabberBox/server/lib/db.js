import mongoose, { mongo } from "mongoose";

// function to connect to the mongoDB database

export const connectDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);

    mongoose.connection.on("connected", () =>
      console.log("Database connected")
    );
    await mongoose.connect(`${process.env.MONGO_URI}/chat-app`);
  } catch (error) {
    console.log(error);
  }
};
