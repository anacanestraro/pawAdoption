import type { Usuario, AuthContextType } from "../types"; 
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from "react";
import api from '../api/api';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children:ReactNode}) => {
    const [usuario, setUsuario] = useState<Usuario | null>(() => {
        const salvo = localStorage.getItem('usuario');
        return salvo ? JSON.parse(salvo) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const login = async (email: string, senha:string) => {
        const res = await api.post('/auth/login', { email, senha });
        const { token, usuario } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        setToken(token);
        setUsuario(usuario);
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, token, login, logout }}>
            {children}
            </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);