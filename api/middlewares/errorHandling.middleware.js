import { ApiResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    // Log the full error on the server console (for debugging)
    logger.error(`Error: ${err.message}`);

    // Send a generic error message to the frontend
    res.status(err.statuscode || 500).json(new ApiResponse(err.statuscode || 500, {}, err.message));
};