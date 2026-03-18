import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoutes = () => {
    const { usuario, token } = useAuth()

    if (!token || !usuario) {
        return <Navigate to="/login" replace/>
    }

    if (usuario.tipo_usuario === 'ADMINISTRADOR') {
        return <Navigate to="/admin" replace/>
    }

    return <Outlet/>
}

export const AdminRoutes = () => {
    const { usuario, token } = useAuth()

    if (!token || !usuario) {
        return <Navigate to="/login" replace/>
    }

    if (usuario.tipo_usuario !== 'ADMINISTRADOR') {
        return <Navigate to="/home" replace/>
    }

    return <Outlet/>
}