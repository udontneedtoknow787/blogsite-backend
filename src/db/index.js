import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(connectionInstance.connection.host)
        return connectionInstance;
    } catch (error) {
        console.log(" Database connection Error.  " + error)
        process.exit(1)
    }
}

export default connectToDB