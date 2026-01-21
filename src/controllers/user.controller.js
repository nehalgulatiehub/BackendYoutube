import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

import jwt from 'jsonwebtoken'

import { ApiResponse } from '../utils/apiResponse.js'

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    console.log('this is error', error)

    throw new ApiError(
      500,
      'Something went wrong while generating access token'
    )
  }
}

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

  const { fullName, email, username, password } = req.body || {}

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

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  })

  if (existedUser) {
    throw new ApiError(409, 'User aleready exists')
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

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
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User Registered Successfully'))
})

//req body
//is user exist
//if existis password correct
//generate accesstoken and refreshtoken
//send token via cookies

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body || {}

  if (!username && !email) {
    throw new ApiError(400, 'Username or email is required')
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  })

  if (!user) {
    throw new ApiError(404, 'User not exists')
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(404, 'Password is incorrect')
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  )

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  )

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        'User logged in successfully'
      )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  )

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out'))
})

const requestAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized Invalid Incoming Token')
  }
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  console.log(decodedToken)

  const user = await User.findById(decodedToken?._id)
  if (!user) {
    throw new ApiError(401, 'Invalid Refresh Token')
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, 'Refresh token not matched')
  }

  const options = {
    httpOnly: true,
  }

  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  )

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshtoken', newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        'Access Token Refreshed'
      )
    )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid old password')
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current User Fetched Successfully'))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body
  if (!fullName || !email) {
    throw new ApiError(400, 'All fields are required')
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select('-password')

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Account details updated sucessfully'))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing')
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if (!avatar.url) {
    throw new ApiError(400, 'Error while uploading on avatar')
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select('-password')

  return res.status(200).json(new ApiResponse(200, user, 'Avatar is updated'))
})

const updatecoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(401, 'coverImage path not found')
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!coverImage.url) {
    throw new ApiError(400, 'Cloudinary url not found for coverImage')
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select('-password')
  return res.status(200).json(new ApiResponse(200, user, 'Cover Image updated'))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params
  if (!username?.trim()) {
    throw new ApiError(400, 'Unable to get username')
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: '$subscribers',
        },
        channelsSubscribedCount: {
          $size: 'subscribedTo',
        },
        isSubscribed: {
          $condition: {
            if: { $in: [req.user?._id, '$subscribers.subscriber'] },
            then: true,
            elese: false,
          },
        },
      },
    },

    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        isSubscribed: 1,
        channelsSubscribedCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ])
  if (!channel?.length) {
    throw new ApiError(404, 'Channel not exists')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], 'User channel fetched succesfully'))
})

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: '$owner',
              },
            },
          },
        ],
      },
    },
  ])
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistroy,
        'Watch history fetched successfully'
      )
    )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  requestAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updatecoverImage,
  getUserChannelProfile,
  getWatchHistory,
}
