import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']

        },
        fullname:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:{
            type: String, //cloudinary url
            required:true,
            trim: true
        },
        coverimage:{
            type: String,
            trim: true
        },
        watchHistory:{
            type: Schema.Types.ObjectId,
            ref: 'video'
        },
        password:{
            type: String,
            required: [true, 'password is required']
        },
        refreshtoken:{
            type: String,
        },

    },{timestamps: true}
)

userSchema.pre("save", async function (next) {
    if(!this.isModified('password')){
        return
    }
    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
    
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.REFRESH_TOKEN_STRING,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)

}

export const User = mongoose.model("User",userSchema)