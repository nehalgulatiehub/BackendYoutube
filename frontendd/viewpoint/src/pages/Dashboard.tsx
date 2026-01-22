import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import {
  FaEye,
  FaUserFriends,
  FaHeart,
  FaVideo,
  FaPlus,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaGlobe,
  FaLock,
} from 'react-icons/fa'
import { useAuthStore } from '../store/autoStore.ts'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export const Dashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/videos'),
        ])
        setStats(statsRes.data.data)
        setVideos(videosRes.data.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  const handleEdit = async (videoId: string) => {
    const newTitle = prompt('Enter new title:')
    const newDescription = prompt('Enter new description:')
    if (newTitle || newDescription) {
      try {
        await api.patch(`/videos/${videoId}`, {
          title: newTitle,
          description: newDescription,
        })
        toast.success('Video updated')
        // Refresh videos
        const videosRes = await api.get('/dashboard/videos')
        setVideos(videosRes.data.data)
      } catch (error) {
        toast.error('Failed to update video')
      }
    }
    setOpenMenu(null)
  }

  const handleTogglePublish = async (videoId: string) => {
    try {
      await api.patch(`/videos/toggle/publish/${videoId}`)
      toast.success('Publish status toggled')
      // Refresh videos
      const videosRes = await api.get('/dashboard/videos')
      setVideos(videosRes.data.data)
    } catch (error) {
      toast.error('Failed to toggle publish status')
    }
    setOpenMenu(null)
  }

  const handleDelete = async (videoId: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await api.delete(`/videos/${videoId}`)
        toast.success('Video deleted')
        setVideos(videos.filter((v) => v._id !== videoId))
      } catch (error) {
        toast.error('Failed to delete video')
      }
    }
    setOpenMenu(null)
  }

  if (!stats)
    return <div className="p-10 text-gray-400">Loading dashboard...</div>

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome Back, {user?.fullName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Seamless Video Management, Elevated Results.
          </p>
        </div>
        <Link
          to="/upload"
          className="bg-[#ae7aff] text-black px-4 py-2 rounded font-semibold hover:bg-[#9a66e8] flex items-center gap-2"
        >
          <FaPlus /> Upload video
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FaEye} label="Total views" value={stats.totalViews} />
        <StatCard
          icon={FaUserFriends}
          label="Total subscribers"
          value={stats.totalSubscribers}
        />
        <StatCard icon={FaHeart} label="Total likes" value={stats.totalLikes} />
        <StatCard
          icon={FaVideo}
          label="Total Videos"
          value={stats.totalVideos}
        />
      </div>

      <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0f0f0f] border-b border-gray-800 text-white font-semibold">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Uploaded</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Date uploaded</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {videos.map((video) => (
              <tr
                key={video._id}
                className="hover:bg-[#1f1f1f] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${video.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`}
                    ></div>
                    <span className="text-sm">
                      {video.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white font-medium">
                  {video.title}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${video.isPublished ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}
                  >
                    {video.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 bg-[#272727] w-fit px-2 py-1 rounded-full">
                    <span className="text-green-400 text-xs">
                      {video.likesCount || 0} likes
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(video.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === video._id ? null : video._id)
                    }
                    className="text-gray-400 hover:text-white"
                  >
                    <FaEllipsisV />
                  </button>
                  {openMenu === video._id && (
                    <div className="absolute right-0 mt-2 w-40 bg-[#272727] border border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleTogglePublish(video._id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#3f3f3f] hover:text-white"
                      >
                        {video.isPublished ? <FaLock /> : <FaGlobe />}{' '}
                        {video.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleEdit(video._id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#3f3f3f] hover:text-white"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-[#3f3f3f]"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {videos.length === 0 && (
          <div className="p-8 text-center text-gray-500">No videos found</div>
        )}
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value }: any) => {
  return (
    <div className="bg-[#0f0f0f] p-6 border border-gray-800">
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-[#ae7aff]/10 text-[#ae7aff] border border-[#ae7aff]/20">
        <Icon className="text-lg" />
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
    </div>
  )
}
