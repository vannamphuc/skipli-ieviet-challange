import { Navigate, Outlet } from 'react-router'
import Cookies from 'js-cookie'

export default function ProtectedLayout() {
  const token = Cookies.get('accessToken')

  if (!token) {
    return <Navigate to='/' replace />
  }

  return <Outlet />
}
