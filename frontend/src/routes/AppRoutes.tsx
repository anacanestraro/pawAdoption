import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoutes, AdminRoutes } from './PrivateRoutes'
import { PublicRoutes } from './PublicRoutes'
import { Layout } from '../components/Layout'
import { AdminLayout } from '../components/AdminLayout'
import { AnimalFeed } from '../pages/AnimalFeed'
import { AbrigoFeed } from '../pages/AbrigoFeed'

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Rotas privadas — ADOTANTE e ABRIGO */}
      <Route element={<PrivateRoutes />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<AnimalFeed/>} />
          <Route path="/abrigos" element={<AbrigoFeed/>} />         
          <Route path="/home/animais" element={<h1>Meus Animais</h1>} />
          <Route path="/home/voluntarios" element={<h1>Voluntários</h1>} />
          <Route path="/home/solicitacoes" element={<h1>Solicitações</h1>} />
          <Route path="/contato" element={<h1>Contato</h1>} />
          <Route path="/sobre" element={<h1>Sobre</h1>} />
        </Route>
      </Route>

      {/* Rotas privadas — ADMINISTRADOR */}
      <Route element={<AdminRoutes />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/validacoes" replace />} />
          <Route path="/admin/validacoes" element={<h1>Validações</h1>} />
          <Route path="/admin/denuncias" element={<h1>Denúncias</h1>} />
          <Route path="/admin/usuarios" element={<h1>Usuários</h1>} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}