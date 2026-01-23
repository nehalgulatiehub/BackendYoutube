import mongoose, { isValidObjectId } from 'mongoose'
import { Tweet } from '../models/tweets.models.js'
import { User } from '../models/user.models.js'
import { ApiError } from '../utils/apiError.js'
import { apiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body

  if (!content) {
    throw new ApiError(400, 'Content is required')
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  })

  if (!tweet) {
    throw new ApiError(500, 'Failed to create tweet')
  }

  return res
    .status(201)
    .json(new apiResponse(201, tweet, 'Tweet created successfully'))
})

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid userId')
  }

  const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 })

  return res
    .status(200)
    .json(new apiResponse(200, tweets, 'User tweets fetched successfully'))
})

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  const { content } = req.body

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweetId')
  }

  if (!content) {
    throw new ApiError(400, 'Content is required')
  }

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user._id },
    { content },
    { new: true }
  )

  if (!tweet) {
    throw new ApiError(404, 'Tweet not found or not authorized')
  }

  return res
    .status(200)
    .json(new apiResponse(200, tweet, 'Tweet updated successfully'))
})

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweetId')
  }

  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  })

  if (!tweet) {
    throw new ApiError(404, 'Tweet not found or not authorized')
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, 'Tweet deleted successfully'))
})

export { createTweet, getUserTweets, updateTweet, deleteTweet }
