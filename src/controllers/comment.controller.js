import mongoose from 'mongoose'
import { Comment } from '../models/comment.model.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Video } from '../models/video.models.js'
import { apiResponse } from '../utils/apiResponse.js'
const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID')
  }
  let pageNumber = Number(page)
  let limitNumber = Number(limit)
  if (pageNumber <= 0) {
    throw new ApiError(400, 'Invalid page number')
  }
  if (limitNumber <= 0) {
    throw new ApiError(400, 'Invalid limit page')
  }
  const skip = (page - 1) * limit
  const comments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('owner', 'username avatar')

  const TotalCommentCount = await Comment.countDocuments({ video: videoId })
  return res.status(200).json(
    new apiResponse(
      200,
      {
        comments,
        TotalCommentCount,
        page,
        limit,
      },
      'Comments fetched successfully'
    )
  )
})

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params
  const { content } = req.body

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not logged In')
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, 'Video ID is not valid')
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new ApiError(400, 'Comment content required')
  }
  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
  })

  const populatedComment = await Comment.findById(comment._id).populate(
    'owner',
    'username avatar'
  )

  return res
    .status(200)
    .json(new apiResponse(200, populatedComment, 'Comment done successfully'))
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { content } = req.body

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'You must login to update comment')
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, 'Comment ID is invalid')
  }
  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Invalid Access for comment')
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new ApiError(401, 'Content is required for comment')
  }
  comment.content = content.trim()
  await comment.save()
  return res
    .status(200)
    .json(new apiResponse(200, comment, 'Comment is updated'))
})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Login Required')
  }
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid Comment ID')
  }
  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access Denied')
  }
  await comment.deleteOne()
  return res
    .status(200)
    .json(new apiResponse(200, null, 'Comment deleted successfully'))
})

export { getVideoComments, addComment, updateComment, deleteComment }
