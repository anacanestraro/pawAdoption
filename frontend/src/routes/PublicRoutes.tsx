import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '../pages/Login'
import { Landing } from '../pages/Landing'
import { Cadastro } from '../pages/Cadastro'

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}