import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '../pages/Login'
import { useAuth } from '../context/AuthContext'

export const PublicRoutes = () => {

    const { token, usuario } = useAuth()

    if (token && usuario) {
        return <Navigate to={usuario.tipo_usuario === 'ADMINISTRADOR' ? '/admin' : '/home'} replace />
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<h1>Cadastro</h1>}/>
            <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
    )
}