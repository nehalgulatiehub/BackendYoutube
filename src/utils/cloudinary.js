import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
  cloud_name: 'dpzuah4rn',
  api_key: '883253596483163',
  api_secret: 'twLIrxiAB2aYIs9DZEyoDOtxelM',
})

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    //upload file on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    })

    //file has been uploaded
    fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath) //remove locally saved temporary file as upload got failed
    return null
  }
}

export { uploadOnCloudinary }
