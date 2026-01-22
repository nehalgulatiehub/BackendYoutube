import { useAuthStore } from '../store/autoStore'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

export const Login = () => {
  const { register, handleSubmit } = useForm()
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data: any) => {
    try {
      // Backend likely accepts 'email' or 'username'. Sending both if user enters one?
      // Usually backend checks if input matches email regex, else treats as username.
      // We'll send 'email' if it looks like email, else 'username'.
      // Or just send 'username' field if backend handles it.
      // Let's assume backend expects 'username' or 'email' keys.
      // We'll send the input as 'username' for now.

      const response = await api.post('/users/login', {
        username: data.identifier,
        email: data.identifier.includes('@') ? data.identifier : undefined,
        password: data.password,
      })

      login(response.data.data.user)
      toast.success('Logged in successfully')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <input
              {...register('identifier')}
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
