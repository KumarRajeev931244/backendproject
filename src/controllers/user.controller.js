import {asyncHandler} from '../utils/asyncHandle.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadONCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'


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



export  { registerUser}