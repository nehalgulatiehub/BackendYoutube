import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FaHome,
  FaHistory,
  FaThumbsUp,
  FaVideo,
  FaChartBar,
  FaUserFriends,
} from 'react-icons/fa'
import { useAuthStore } from '../store/autoStore'
import clsx from 'clsx'

export const Sidebar = () => {
  const { pathname } = useLocation()
  const { user } = useAuthStore()

  const links = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Liked Videos', path: '/liked-videos', icon: FaThumbsUp },
    { name: 'History', path: '/history', icon: FaHistory },
    { name: 'My Content', path: '/my-content', icon: FaVideo },
    { name: 'Dashboard', path: '/dashboard', icon: FaChartBar },
    {
      name: 'Subscribed Channels',
      path: '/subscriptions',
      icon: FaUserFriends,
    },
  ]

  return (
    <aside className="w-64 bg-[#0f0f0f] h-[calc(100vh-64px)] fixed top-16 left-0 border-r border-gray-800 overflow-y-auto hidden md:block custom-scrollbar">
      <div className="p-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={clsx(
              'flex items-center gap-5 px-4 py-3 rounded-xl transition-all duration-200',
              pathname === link.path
                ? 'bg-[#272727] text-white font-medium'
                : 'text-gray-300 hover:bg-[#272727] hover:text-white'
            )}
          >
            <link.icon className="text-xl" />
            <span className="text-sm tracking-wide">{link.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}
