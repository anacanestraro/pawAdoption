import { Outlet } from 'react-router-dom'
import { AppNavbar } from './AppNavbar'
import { AppFooter } from './AppFooter'

export const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNavbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <AppFooter variant="compact" />
    </div>
  )
}