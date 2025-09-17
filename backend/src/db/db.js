import mongoose from "mongoose";

const  DB_NAME  = "AI_Saas_DB";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log("MongoDB connected || Host "+" : "+connectionInstance.connection.host);
    
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;