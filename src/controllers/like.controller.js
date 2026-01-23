import mongoose, { isValidObjectId } from 'mongoose'
import { Like } from '../models/likes.models.js'
import { Video } from '../models/video.models.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: toggle like on comment
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Not Authorized')
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID')
  }

  const like = await Like.findOne({ video: videoId, likedBy: req.user._id })
  let liked
  if (like) {
    await like.deleteOne()
    liked = false
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    })
    liked = true
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { isLiked: liked },
        liked ? 'Video Liked' : 'Video Unliked'
      )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User is unauthorized')
  }
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, 'Comment id is not found')
  }
  const like = await Like.findOne({ comment: commentId, likedBy: req.user._id })
  let liked
  if (like) {
    await like.deleteOne()
    liked = false
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    })
    liked = true
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { isLiked: liked },
        liked ? 'Comment Liked' : 'Comment unliked'
      )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Login is required')
  }
  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Tweet ID is invalid')
  }
  const like = await Like.findOne({ tweet: tweetId, likedBy: req.user._id })
  let liked
  if (like) {
    await like.deleteOne()
    liked = false
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    })
    liked = true
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { isLiked: liked },
        liked ? 'Tweet Liked' : 'Tweet unliked'
      )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Login is required')
  }
  const userId = req.user._id

  const likes = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  }).sort({ createdAt: -1 })

  const videoIds = likes.map((like) => like.video)
  if (videoIds.length === 0) {
    return res.status(200).json(new apiResponse(200, [], 'No liked vide found'))
  }
  const videos = await Video.find({
    _id: { $in: videoIds },
    isPublished: true,
  }).populate('owner', 'username avatar')

  return res
    .status(200)
    .json(new apiResponse(200, videos, 'Like videos fetched successfully '))
})

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos }
