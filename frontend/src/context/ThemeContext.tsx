/**
 * ThemeContext.tsx
 * Gerencia dark/light mode globalmente.
 * Persiste no localStorage e aplica data-theme no <html>.
 */

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('paw_theme') as Theme) || 'light'
  })

  const applyTheme = (t: Theme) => {
    document.documentElement.dataset.theme = t
    localStorage.setItem('paw_theme', t)

    // Atualiza o padrão de patinhas no body conforme o tema
    const fill = t === 'dark' ? 'FFFFFF' : '175EA8'
    const op   = t === 'dark' ? '0.04'   : '0.03'
    const svg  = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%23${fill}' fill-opacity='${op}'><ellipse cx='22' cy='30' rx='4' ry='5'/><ellipse cx='31' cy='24' rx='3.5' ry='4.5'/><ellipse cx='40' cy='24' rx='3.5' ry='4.5'/><ellipse cx='49' cy='30' rx='4' ry='5'/><path d='M30 43c0-5.5 3-9 7-9s7 3.5 7 9c0 3.5-2.5 5-5 5s-1.5 1-2 1-1.5-1-3.5-1-3.5-1.5-3.5-5z'/><ellipse cx='82' cy='90' rx='3' ry='4'/><ellipse cx='89' cy='85' rx='2.8' ry='3.8'/><ellipse cx='96' cy='85' rx='2.8' ry='3.8'/><ellipse cx='103' cy='90' rx='3' ry='4'/><path d='M88 100c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5c0 3-2 4-4 4s-1.2.8-1.5.8-1.2-.8-2.5-.8-3-1-3-4z'/></g></svg>`
    document.body.style.backgroundImage = `url("data:image/svg+xml;utf8,${svg}")`
    document.body.style.backgroundSize = '120px 120px'
    document.body.style.backgroundRepeat = 'repeat'
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = (t: Theme) => {
    setThemeState(t)
  }

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}