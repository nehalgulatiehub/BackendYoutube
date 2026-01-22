import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

export const Watch = () => {
  const { videoId } = useParams()
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get(`/videos/${videoId}`)
        setVideo(response.data.data)
      } catch (error) {
        console.error('Failed to fetch video', error)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) fetchVideo()
  }, [videoId])

  if (loading)
    return <div className="p-10 text-center text-gray-400">Loading...</div>
  if (!video)
    return <div className="p-10 text-center text-gray-400">Video not found</div>

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
        <video
          src={video.videoFile}
          poster={video.thumbnail}
          controls
          className="w-full h-full"
          onError={(e) => console.error('Video load error', e)}
        />
      </div>
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-white">{video.title}</h1>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <img
              src={video.owner?.avatar}
              alt={video.owner?.username}
              className="w-12 h-12 rounded-full object-cover border border-gray-700"
            />
            <div>
              <h3 className="font-semibold text-white text-lg">
                {video.owner?.username}
              </h3>
              <p className="text-sm text-gray-400">
                {video.owner?.subscribersCount || 0} subscribers
              </p>
            </div>
            <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors ml-4">
              Subscribe
            </button>
          </div>
          <div className="flex gap-2">
            <button className="bg-[#272727] text-white px-6 py-2 rounded-full hover:bg-[#3f3f3f] flex items-center gap-2 transition-colors border border-gray-700">
              Like {video.likesCount || 0}
            </button>
          </div>
        </div>
        <div className="mt-6 bg-[#1f1f1f] p-4 rounded-xl border border-gray-800">
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  )
}
