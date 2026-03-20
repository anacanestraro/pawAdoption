import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f3fa' }}>
      <Navbar />
      <main style={{ padding: '32px 40px' }}>
        <Outlet />
      </main>
    </div>
  )
}