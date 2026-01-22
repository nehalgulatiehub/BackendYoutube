import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const Upload = () => {
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: any) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    if (data.videoFile && data.videoFile[0])
      formData.append('videoFile', data.videoFile[0])
    if (data.thumbnail && data.thumbnail[0])
      formData.append('thumbnail', data.thumbnail[0])

    try {
      const response = await api.post('/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const video = response.data.data
      if (video && video._id) {
        // Auto-publish the video
        await api.patch(`/videos/toggle/publish/${video._id}`)
      }
      toast.success('Video uploaded and published successfully')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-8 rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Upload Video</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            {...register('title', { required: true })}
            type="text"
            className="mt-1 block w-full bg-[#121212] border border-gray-700 rounded-md shadow-sm p-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="Enter video title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            {...register('description', { required: true })}
            rows={4}
            className="mt-1 block w-full bg-[#121212] border border-gray-700 rounded-md shadow-sm p-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Enter video description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Video File
          </label>
          <input
            {...register('videoFile', { required: true })}
            type="file"
            accept="video/*"
            className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Thumbnail
          </label>
          <input
            {...register('thumbnail', { required: true })}
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  )
}
