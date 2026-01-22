import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout.tsx'
import { Home } from './pages/Home.tsx'
import { Login } from './pages/Login.tsx'
import { Signup } from './pages/Signup.tsx'
import { Watch } from './pages/Watch.tsx'
import { Upload } from './pages/Upload.tsx'
import { Tweets } from './pages/Tweets.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { LikedVideos } from './pages/LikedVideos.tsx'
import { History } from './pages/History.tsx'
import { SubscribedChannels } from './pages/SubscribedChannels.tsx'
import { Channel } from './pages/Channel'
import { MyContent } from './pages/MyContent.tsx'
import { EditProfile } from './pages/EditProfile.tsx'
import { useAuthStore } from './store/autoStore.ts'

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="watch/:videoId" element={<Watch />} />
          <Route path="upload" element={<Upload />} />
          <Route path="tweets" element={<Tweets />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="liked-videos" element={<LikedVideos />} />
          <Route path="history" element={<History />} />
          <Route path="subscriptions" element={<SubscribedChannels />} />
          <Route path="my-content" element={<MyContent />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="c/:username" element={<Channel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
