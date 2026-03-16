import { Routes, Route } from 'react-router-dom'
import { PublicRoutes } from './PublicRoutes'

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/*" element={<PublicRoutes/>}/>
        </Routes>
    )
}