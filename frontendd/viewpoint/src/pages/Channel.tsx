import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/autoStore.ts'
import { FaPlayCircle, FaList, FaTwitter } from 'react-icons/fa'

export const Channel = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuthStore()
  const [channel, setChannel] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('Videos')
  const [videos, setVideos] = useState<any[]>([])
  const [tweets, setTweets] = useState<any[]>([])

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const targetUsername = username
        if (!targetUsername) return

        const res = await api.get(`/users/c/${targetUsername}`)
        setChannel(res.data.data)

        // Fetch videos
        if (targetUsername === currentUser?.username) {
          const vids = await api.get('/dashboard/videos')
          setVideos(vids.data.data)
        } else {
          const vids = await api.get('/videos')
          // Client side filter as fallback
          const allVideos = vids.data.data.docs || vids.data.data
          setVideos(
            allVideos.filter((v: any) => v.owner.username === targetUsername)
          )
        }

        // Fetch tweets (if we had the user ID from the profile response)
        // The profile response usually contains _id.
        if (res.data.data._id) {
          const twts = await api.get(`/tweets/user/${res.data.data._id}`)
          setTweets(twts.data.data)
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchChannel()
  }, [username, currentUser])

  if (!channel)
    return <div className="p-10 text-white text-center">Loading channel...</div>

  return (
    <div className="text-white w-full">
      {/* Cover Image */}
      <div className="h-40 md:h-60 w-full bg-gray-800 overflow-hidden relative">
        <img
          src={channel.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Channel Info */}
      <div className="px-6 md:px-10 pb-4 border-b border-gray-800 bg-[#0f0f0f]">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-10 relative z-10">
          <img
            src={channel.avatar}
            alt="Avatar"
            className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#0f0f0f] object-cover bg-gray-800"
          />
          <div className="flex-1 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              {channel.fullName}
            </h1>
            <p className="text-gray-400">@{channel.username}</p>
            <p className="text-gray-400 text-sm mt-1">
              {channel.subscribersCount} Subscribers •{' '}
              {channel.channelsSubscribedToCount} Subscribed
            </p>
          </div>
          <div className="mb-4 w-full md:w-auto">
            {currentUser?.username === channel.username ? (
              <button className="bg-[#ae7aff] text-black px-6 py-2 rounded font-semibold hover:bg-[#9a66e8] w-full md:w-auto">
                Edit Profile
              </button>
            ) : (
              <button className="bg-[#ae7aff] text-black px-6 py-2 rounded font-semibold hover:bg-[#9a66e8] w-full md:w-auto">
                Subscribe
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mt-8 border-b border-gray-800 overflow-x-auto">
          {['Videos', 'Playlist', 'Tweets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-[#ae7aff] border-b-2 border-[#ae7aff]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-10 min-h-[400px]">
        {activeTab === 'Videos' &&
          (videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-[#1f1f1f] rounded-xl overflow-hidden border border-gray-800"
                >
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnail}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold line-clamp-2 text-sm">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {video.views} views •{' '}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 bg-[#ae7aff]/20 rounded-full flex items-center justify-center mb-4 text-[#ae7aff]">
                <FaPlayCircle className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold">No videos uploaded</h3>
              <p className="text-gray-400 mt-2 text-sm">
                This page has yet to upload a video.
              </p>
            </div>
          ))}

        {activeTab === 'Tweets' &&
          (tweets.length > 0 ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              {tweets.map((tweet) => (
                <div
                  key={tweet._id}
                  className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-800"
                >
                  <p>{tweet.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(tweet.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 bg-[#ae7aff]/20 rounded-full flex items-center justify-center mb-4 text-[#ae7aff]">
                <FaTwitter className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold">No tweets yet</h3>
            </div>
          ))}

        {activeTab === 'Playlist' && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 bg-[#ae7aff]/20 rounded-full flex items-center justify-center mb-4 text-[#ae7aff]">
              <FaList className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold">No playlists created</h3>
            <p className="text-gray-400 mt-2 text-sm">
              There are no playlists on this channel.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}
