import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

const healthcheck = AsyncHandler( async(req, res) => {
    logger.debug("Healthcheck route hit")
    return res.status(200).json( new ApiResponse(200, "OK", "Server is up and running") )
})

export { healthcheck }