import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export const LikedVideos = () => {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/likes/videos')
      .then((res) => setVideos(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-10 text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Liked Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((item) => {
          const video = item.video
          if (!video) return null
          return (
            <Link to={`/watch/${video._id}`} key={item._id} className="group">
              <div className="aspect-video rounded-xl overflow-hidden bg-[#272727] mb-3 relative">
                <img
                  src={video.thumbnail}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt=""
                />
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <h3 className="font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {video.owner?.username}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}
