import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/autoStore'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const Tweets = () => {
  const { user } = useAuthStore()
  const { register, handleSubmit, reset } = useForm()
  const [tweets, setTweets] = useState<any[]>([])

  const fetchTweets = async () => {
    if (!user) return
    try {
      const response = await api.get(`/tweets/user/${user._id}`)
      setTweets(response.data.data)
    } catch (error) {
      console.error('Failed to fetch tweets', error)
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [user])

  const onSubmit = async (data: any) => {
    try {
      await api.post('/tweets', { content: data.content })
      reset()
      fetchTweets()
      toast.success('Tweet posted!')
    } catch (error) {
      toast.error('Failed to post tweet')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tweets</h1>
      {user && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
          <textarea
            {...register('content', { required: true })}
            placeholder="What's happening?"
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white resize-none"
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tweet
          </button>
        </form>
      )}
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <div key={tweet._id} className="p-4 bg-[#1a1a1a] rounded-lg">
            <p className="text-white">{tweet.content}</p>
            <p className="text-gray-400 text-sm mt-2">
              {new Date(tweet.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
