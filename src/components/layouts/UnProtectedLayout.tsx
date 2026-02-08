import { Navigate, Outlet, useSearchParams } from 'react-router'
import Cookies from 'js-cookie'
import { useEffect } from 'react'

export default function UnProtectedLayout() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')
  const token = Cookies.get('accessToken')

  useEffect(() => {
    if (tokenFromUrl) {
      Cookies.set('accessToken', tokenFromUrl, { expires: 7 })
      window.location.href = '/dashboard'
    }
  }, [tokenFromUrl])

  if (token && !tokenFromUrl) {
    return <Navigate to='/dashboard' replace />
  }

  return <Outlet />
}
