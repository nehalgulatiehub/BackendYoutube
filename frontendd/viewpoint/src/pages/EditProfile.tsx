import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/autoStore'

export const EditProfile = () => {
  const { user, checkAuth } = useAuthStore()
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: any) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('fullName', data.fullName)
    formData.append('email', data.email)
    if (data.avatar[0]) formData.append('avatar', data.avatar[0])
    if (data.coverImage[0]) formData.append('coverImage', data.coverImage[0])

    try {
      await api.patch('/users/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await checkAuth() // Refresh user data
      toast.success('Profile updated!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div>Please login</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            {...register('fullName')}
            defaultValue={user.fullName}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register('email')}
            defaultValue={user.email}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Avatar</label>
          <input
            {...register('avatar')}
            type="file"
            accept="image/*"
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <input
            {...register('coverImage')}
            type="file"
            accept="image/*"
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  )
}