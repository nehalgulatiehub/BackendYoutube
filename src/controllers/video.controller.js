import mongoose, { mongo } from 'mongoose'
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
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthorised Request')
  }
  const { title, description } = req.body

  const videoFile = req.files.videoFile[0]
  const thumbnail = req.files.thumbnail[0]

  if (!videoFile) {
    throw new ApiError(400, 'Unable to get video file Please upload again')
  }
  if (!thumbnail) {
    throw new ApiError(400, 'Please upload thumbnail')
  }

  if (!title || title.trim() === '') {
    throw new ApiError(400, 'title is required')
  }
  const videoUploaded = await uploadOnCloudinary(videoFile.path)
  if (!videoUploaded || !videoUploaded.url) {
    throw new ApiError(500, 'Video not uploaded successfully')
  }
  const thumbnailUploaded = await uploadOnCloudinary(thumbnail.path)
  if (!thumbnailUploaded || !thumbnailUploaded.url) {
    throw new ApiError(500, 'Thumbnail not uploaded successfully')
  }
  const video = await Video.create({
    title,
    description,
    owner: req.user._id,
    duration: videoUploaded.duration,
    isPublished: false,
    videoFile: {
      url: videoUploaded.url,
      public_id: videoUploaded.url,
    },
    thumbnail: {
      url: thumbnailUploaded.url,
      public_id: thumbnailUploaded.url,
    },
  })

  return res
    .status(201)
    .json(new ApiResponse(201, { video }, 'Video saved draft successfully'))
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid videoId')
  }
  const video = await Video.findById(videoId).populate(
    'owner',
    'username avatar'
  )
  if (!video) {
    throw new ApiError(404, 'Video not found')
  }

  if (!video.isPublished) {
    if (!req.user || video.owner._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access Denied')
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video fetched successfully'))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthrorized Access')
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(403, 'Invalid Video ID')
  }
  const video = await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, 'Video not found')
  }
  if (req.user._id.toString() !== video.owner._id.toString()) {
    throw new ApiError(403, 'Unauthorized Access')
  }

  const { title, description } = req.body
  const thumbnail = req.files?.thumbnail[0]
  if (!(title || description || thumbnail)) {
    throw new ApiError(400, 'Nothing to update')
  }

  if (thumbnail) {
    const thumbnailUploaded = await uploadOnCloudinary(thumbnail.path)
    if (!thumbnailUploaded || !thumbnailUploaded.url) {
      throw new ApiError(500, 'Thumbnail not updated Server Error')
    }
    video.thumbnail = {
      url: thumbnailUploaded.url,
      public_id: thumbnailUploaded.public_id,
    }
  }
  if (title.trim() !== '') {
    video.title = title.trim()
  }
  if (description.trim() !== '') {
    video.description = description.trim()
  }
  if (!description.trim() === '') {
    throw new ApiError(401, 'Description is required')
  }
  await video.save()
  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video updated successfully'))
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not logged IN')
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, 'Video ID is not valid')
  }
  const video = await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, 'Video Not Found')
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Invalid Access')
  }

  if (video.videoFile?.public_id) {
    const videoDeleteResult = await cloudinary.uploader.destroy(
      video.videoFile.public_id,
      {
        resource_type: 'video',
      }
    )
    if (videoDeleteResult.result !== 'ok') {
      throw new ApiError(500, 'Failed to delete video from cloudinary')
    }
  }
  if (video.thumbnail?.public_id) {
    const thumbnailDeleteResult = await cloudinary.uploader.destroy(
      video.thumbnail.public_id
    )
    if (thumbnailDeleteResult.result !== 'ok') {
      throw new ApiError(500, 'Failed to delete thumbnail from cloudinary')
    }
  }
  await Video.deleteOne()

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Video deleted successfully'))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Invalid Authorization')
  }
  const isVideoValid = mongoose.isValidObjectId(videoId)
  if (!isVideoValid) {
    throw new ApiError(400, 'Invalid Video ID')
  }
  const video = await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, 'Video Not found')
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not allowed to modify this video')
  }
  video.isPublished = !video.isPublished
  await video.save()
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        video.isPublished
          ? 'Video Published Successfully'
          : 'Video unpublished Successfully',
        'Toggle Done'
      )
    )
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
}
