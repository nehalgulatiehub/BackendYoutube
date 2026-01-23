import mongoose from 'mongoose'
import { Video } from '../models/video.models.js'
import { Subscription } from '../models/subscriptions.models.js'
import { Like } from '../models/likes.models.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * GET CHANNEL STATS
 * Private API – only channel owner
 */
const getChannelStats = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthorized request')
  }

  const channelId = req.user._id

  const totalVideos = await Video.countDocuments({ owner: channelId })

  //  Total views (sum of views of all videos)
  const channelVideos = await Video.find({ owner: channelId }, { views: 1 })

  const totalViews = channelVideos.reduce(
    (sum, video) => sum + (video.views || 0),
    0
  )

  // Total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  })

  // Total likes on channel videos
  const videoIds = channelVideos.map((video) => video._id)

  const totalLikes = await Like.countDocuments({
    video: { $in: videoIds },
  })

  //  Respond
  return res.status(200).json(
    new apiResponse(
      200,
      {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes,
      },
      'Channel stats fetched successfully'
    )
  )
})

/**
 * GET CHANNEL VIDEOS
 * Private API – only channel owner
 */
const getChannelVideos = asyncHandler(async (req, res) => {
  // 1️⃣ Auth check
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthorized request')
  }

  const channelId = req.user._id

  // 2️⃣ Fetch videos uploaded by channel
  const videos = await Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .select('title description thumbnail views isPublished createdAt')

  // 3️⃣ Respond
  return res
    .status(200)
    .json(new apiResponse(200, videos, 'Channel videos fetched successfully'))
})

export { getChannelStats, getChannelVideos }
