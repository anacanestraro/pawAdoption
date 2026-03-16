import { Routes, Route } from 'react-router-dom';

export const PublicRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<h1>Home</h1>}/>
            <Route path="/login" element={<h1>Login</h1>}/>
        </Routes>
    )
}