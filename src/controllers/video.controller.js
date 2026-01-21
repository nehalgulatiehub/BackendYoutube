import mongoose from 'mongoose'
import { User } from '../models/user.models.js'
import { Video } from '../models/video.models.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

//api goal is to get all videos

const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
  page = Number(page)
  limit = Number(limit)
  if (page <= 0 || Number.isNaN(page)) {
    throw new ApiError(400, 'Page number is invalid')
  }
  if (limit <= 0 || Number.isNaN(limit)) {
    throw new ApiError(400, 'Limit is invalid')
  }

  const filter = {
    isPublished: true,
  }

  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, 'Invalid User ID')
    }
  }
  filter.owner = userId

  if (query) {
    filter.$or = [
      {
        title: { $regex: query, $options: 'i' },
      },
      {
        description: { $regex: query, $options: 'i' },
      },
    ]
  }
  const sortFiled = sortBy || 'createdAt'
  const sortOrder = sortType === 'asc' ? 1 : -1

  const sort = {
    [sortFiled]: sortOrder,
  }
  const skip = (page - 1) * limit
  const video = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('owner', 'username avatar')

  const totalVideos = await Video.countDocuments(filter)
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video, page, limit, totalVideos },
        'Videos Fetched Successfully'
      )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
}
