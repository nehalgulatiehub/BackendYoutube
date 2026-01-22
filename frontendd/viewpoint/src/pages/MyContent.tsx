import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/autoStore'

export const MyContent = () => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  return <Navigate to={`/c/${user.username}`} />
}
