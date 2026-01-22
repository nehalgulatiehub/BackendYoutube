import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

interface Video {
  _id: string
  videoFile: string
  thumbnail: string
  title: string
  description: string
  duration: number
  views: number
  owner: {
    username: string
    avatar: string
  }
  createdAt: string
}

export const Home = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Request latest videos: sort by createdAt descending
        const response = await api.get(
          '/videos?page=1&limit=12&sortBy=createdAt&sortType=desc'
        )
        const videoList = response.data.data.docs || response.data.data
        setVideos(Array.isArray(videoList) ? videoList : [])
      } catch (error) {
        console.error('Failed to fetch videos', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center p-10 text-gray-400">Loading...</div>
    )

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Latest Videos</h1>

      {videos.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-xl">No videos found</p>
          <p className="text-sm mt-2">Be the first to upload one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <Link
              to={`/watch/${video._id}`}
              key={video._id}
              className="group flex flex-col gap-3"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#272727]">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <div className="flex gap-3">
                <img
                  src={video.owner?.avatar}
                  alt={video.owner?.username}
                  className="w-9 h-9 rounded-full object-cover border border-transparent group-hover:border-gray-500 transition-colors"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors text-[15px]">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 hover:text-white transition-colors">
                    {video.owner?.username}
                  </p>
                  <p className="text-sm text-gray-400">
                    {video.views} views • {formatDate(video.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
