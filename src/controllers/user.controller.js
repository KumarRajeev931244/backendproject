import {asyncHandler} from '../utils/asyncHandle.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadONCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()


        // referesh token database mae save karke rakhte hai jise se hamy user se baar baar na puchna padega

        user.refreshtoken = refreshToken
        await user.save({ validateBeforeSave: false })
        
        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
        
    }
}
   

const registerUser = asyncHandler( async (req, res) => {
    /**
     * get user details from frontend
     * validation not empty
     * check if user alredy register: username , email
     * check for images , check for avatar
     * upload to the cloudinary, check for avatar
     * create user object- creation entry in db
     * remove password and referesh token field
     * return response 
     */
    const {fullname, email, username, password} = req.body
    

    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "all field are compulsory are mandatory")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, " user with email or username already exist")
    }
    console.log(req.files)
    const avatarLocalpath= req.files?.avatar[0]?.path
    if(!coverImage[0]){
        console.log("does not exit")
    }
    const coverImageLocalPath = req.files?.coverImage?.path
    // const coverImageLocalPath = req.files?.coverImage?.path
  
    
    
    
    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     coverImageLocalPath = req.files.coverImage?.path
    // }
   
    if(!avatarLocalpath){
        throw new ApiError(400, "avatar file is required")
    }
    
    const avatar =  await uploadONCloudinary(avatarLocalpath)
    const coverImage = await uploadONCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    const createdUser =  await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
})

/**
 * request body se data le aio
 * username or email
 * find the user 
 * password check
 * access and refresh token generate
 * send cookie
 */

const loginUser = asyncHandler(async (req,res) =>{
    // request body se data lena
    const {email, username, password} = req.body

    if (!username && !email) {

        throw new ApiError(400, "username and password is required")
        
    }

    const user =  await User.findOne({
        $or : [{username}, {email}]
    })

    if(!user){
        throw new ApiError(400, "user does not found")
    }

    // for checking the password

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "invalid user password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedINUser  = await User.findById(user._id).select("-password -refreshtoken")

    const options = {
        // this enable cookie do not modify by front end
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(

        /**
         * IN API RESPONSE WE ARE SENDING
         * statusCode,
         * data,
         * message
         */
        new ApiResponse(
            200,
            {
                user:loggedINUser, accessToken,
                refreshToken
            },
            "user logged in successfully"

        )
    )

})



/**
 * for logout user 
 * 
 * we have to clear cookie
 * and clear  refreshToken
 */

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken: undefined
            }

        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logout successfully"))

})

export  { 
    registerUser,
    loginUser,
    logoutUser

}

