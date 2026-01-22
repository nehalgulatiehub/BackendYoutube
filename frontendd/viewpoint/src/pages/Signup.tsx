import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export const Signup = () => {
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: any) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('fullName', data.fullName)
    formData.append('email', data.email)
    formData.append('username', data.username)
    formData.append('password', data.password)
    if (data.avatar[0]) formData.append('avatar', data.avatar[0])
    if (data.coverImage[0]) formData.append('coverImage', data.coverImage[0])

    try {
      await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('fullName')}
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Avatar
              </label>
              <input
                {...register('avatar')}
                type="file"
                accept="image/*"
                required
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <input
                {...register('coverImage')}
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
