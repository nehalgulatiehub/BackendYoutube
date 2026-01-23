import mongoose, { isValidObjectId } from 'mongoose'
import { User } from '../models/user.models.js'
import { Subscription } from '../models/subscriptions.models.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthorized request')
  }

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid channel ID')
  }

  // Prevent users from subscribing to themselves
  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot subscribe to your own channel')
  }

  // Check if channel exists
  const channel = await User.findById(channelId)
  if (!channel) {
    throw new ApiError(404, 'Channel not found')
  }

  // Check if subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  })

  let subscribed = false
  if (existingSubscription) {
    // Unsubscribe
    await Subscription.deleteOne({ _id: existingSubscription._id })
    subscribed = false
  } else {
    // Subscribe
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    })
    subscribed = true
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { subscribed },
        subscribed ? 'Subscribed successfully' : 'Unsubscribed successfully'
      )
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthorized request')
  }

  if (!mongoose.isValidObjectId(subscriberId)) {
    throw new ApiError(400, 'Invalid subscriber ID')
  }

  const subscribers = await Subscription.find({ channel: subscriberId })
    .populate('subscriber', 'username avatar fullName')
    .sort({ createdAt: -1 })

  return res
    .status(200)
    .json(new apiResponse(200, subscribers, 'Subscribers fetched successfully'))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthorized request')
  }

  // If channelId is provided (GET /c/:channelId), check if current user is subscribed to that channel
  if (channelId && mongoose.isValidObjectId(channelId)) {
    const subscription = await Subscription.findOne({
      subscriber: req.user._id,
      channel: channelId,
    })

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { isSubscribed: !!subscription },
          'Subscription status fetched successfully'
        )
      )
  }

  // Otherwise (GET /subscriptions), return all channels the user is subscribed to
  const subscriptions = await Subscription.find({ subscriber: req.user._id })
    .populate('channel', 'username avatar fullName coverImage')
    .sort({ createdAt: -1 })

  const channels = subscriptions.map((sub) => sub.channel)

  return res
    .status(200)
    .json(
      new apiResponse(200, channels, 'Subscribed channels fetched successfully')
    )
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }
