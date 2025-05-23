import { app } from "./app.js";
import connectToDB from "./db/index.js";
import ServerlessHttp from "serverless-http";

const PORT = process.env.PORT || 3000;

connectToDB()
.then(()=>{
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
    // console.log(`Server is running on port ${PORT}`);
})
.catch((error) => { console.log(`Database connection Error.\n ${error}`) });

export default app;