import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import jwt from 'jsonwebtoken'

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    
        if(!token){
            throw new ApiError(401, "unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")
    
        if(!user){            
            throw new ApiError(410, "invalid access token")
        }
            req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
        
    }
})