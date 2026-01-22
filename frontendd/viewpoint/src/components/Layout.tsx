import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export const Layout = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <Header />
      <div className="pt-16 flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
