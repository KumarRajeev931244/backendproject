import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))



app.use(express.json(
    {
        limit: "16kb"
    }
))

// when data come from URL 
app.use(express.urlencoded(
    {
        extended:true,
        limit:"16kb"
    }
))


// here "public" is folder name.
app.use(express.static("public"))

app.use(cookieParser())

// routes

import UserRouter from './routes/user.routes.js'

// routes declaration

// app.get ki jagah aap app.use use karenge

app.use("/api/v1/users", UserRouter)

// http://localhost:8000/api/v1/users







export default app