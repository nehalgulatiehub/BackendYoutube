import { Router } from 'express'
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from '../controllers/subscription.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

// Get all channels user is subscribed to
router.route('/subscriptions').get(getSubscribedChannels)

// Toggle subscription for a channel
router
  .route('/c/:channelId')
  .get(getSubscribedChannels)
  .post(toggleSubscription)

// Get subscribers of a channel
router.route('/u/:subscriberId').get(getUserChannelSubscribers)

export default router
