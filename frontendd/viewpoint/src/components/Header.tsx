import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/autoStore'
import { FaSearch, FaVideo, FaUserCircle, FaBell } from 'react-icons/fa'

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-[#0f0f0f] border-b border-gray-800 fixed w-full z-20 top-0 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-[#ae7aff]">
            <FaVideo className="text-2xl" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans uppercase">
            YouTube
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-8 hidden sm:block">
        <div className="relative flex group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#0f0f0f] border border-gray-700 py-2 px-4 pl-10 text-gray-200 focus:outline-none focus:border-[#ae7aff] placeholder-gray-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <button
              onClick={handleLogout}
              className="bg-[#ae7aff] text-black px-4 py-1.5 rounded font-semibold hover:bg-[#9a66e8] text-sm"
            >
              Logout
            </button>
            <Link
              to={`/c/${user?.username}`}
              className="bg-[#ae7aff] text-black px-4 py-1.5 rounded font-semibold hover:bg-[#9a66e8] text-sm"
            >
              Profile
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-[#ae7aff] text-black px-4 py-1.5 rounded font-semibold hover:bg-[#9a66e8] text-sm"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}
