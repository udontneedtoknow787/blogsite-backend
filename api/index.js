import { app } from "./app.js";
import connectToDB from "./db/index.js";
import ServerlessHttp from "serverless-http";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

connectToDB()
.then(()=>{
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
    // console.log(`Server is running on port ${PORT}`);
})
.catch((error) => { logger.error(`Database connection Error.\n ${error}`) });

export default app;