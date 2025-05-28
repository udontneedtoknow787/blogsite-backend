import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectToDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`, {
            serverSelectionTimeoutMS: 10000
        })
        // console.log(connectionInstance.connection.host)
        console.log("MongoDB connected successfully")
        return connectionInstance;
    } catch (error) {
        logger.error(" Database connection Error.  " + error)
        process.exit(1)
    }
}

export default connectToDB