import { BrowserRouter, Routes, Route } from 'react-router'
import Login from './pages/login'
import SignUp from './pages/signup'
import ProtectedLayout from './components/layouts/ProtectedLayout'
import UnProtectedLayout from './components/layouts/UnProtectedLayout'
import Dashboard from './pages/dashboard'
import BoardDetail from './pages/board'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UnProtectedLayout />}>
          <Route path='/' index element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/boards/:id' element={<BoardDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
