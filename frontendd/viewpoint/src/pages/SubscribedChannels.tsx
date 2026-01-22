import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/autoStore'
import api from '../api/axios'

export const SubscribedChannels = () => {
  const { user } = useAuthStore()
  const [channels, setChannels] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      api
        .get(`/subscriptions/c/${user._id}`)
        .then((res) => setChannels(res.data.data))
        .catch(console.error)
    }
  }, [user])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subscribed Channels</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <div key={channel._id} className="p-4 bg-[#1a1a1a] rounded-lg">
            <img
              src={channel.avatar}
              alt={channel.username}
              className="w-16 h-16 rounded-full mb-2"
            />
            <h3 className="text-white font-semibold">{channel.fullName}</h3>
            <p className="text-gray-400">@{channel.username}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
