import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

import { ApiResponse } from '../utils/apiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
  /*get user details from frontend
  validation - not rmpty
  check if user already exist
  check for images
  check for avatar
  upload them to cloudinary,avatar
  create user object - create entry in db
  remove password n ref token field
  check for user creaation
  return res
  */

  const { fullName, email, username, password } = req.body

  if (fullName === '') {
    throw new ApiError(400, 'Full Name is required')
  }
  if (email === '') {
    throw new ApiError(400, 'Email is required')
  }
  if (username === '') {
    throw new ApiError(400, 'User is required')
  }
  if (password === '') {
    throw new ApiError(400, 'Password is required')
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  })

  if (existedUser) {
    throw new ApiError(409, 'User aleready exists')
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required')
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatar) {
    throw new ApiError(400, 'Avatar is required')
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    email,
    password,
    username,
  })
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  )
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering')
  }
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User Registered Successfully")
  )
})

export { registerUser }
