import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export const History = () => {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/users/watch-history')
      .then((res) => setVideos(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-10 text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>
      <div className="flex flex-col gap-4">
        {videos.map((video) => (
          <Link
            to={`/watch/${video._id}`}
            key={video._id}
            className="group flex gap-4 bg-[#1f1f1f] p-4 rounded-xl hover:bg-[#272727] transition-colors"
          >
            <div className="w-40 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
              <img
                src={video.thumbnail}
                className="w-full h-full object-cover"
                alt=""
              />
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors line-clamp-2">
                {video.title}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {video.owner?.username} • {video.views} views
              </p>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                {video.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}
