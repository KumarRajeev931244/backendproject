import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'


    // Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadONCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        //file has been uploaded successfully
        // console.log("file is uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {

        // remove the locally saved temporly file as the upload open operation got failed.

        fs.unlinkSync(localFilePath)
        return null
        
    }

}

export {uploadONCloudinary}
   
    
   