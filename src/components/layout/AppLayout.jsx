import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Sidebar from '../nav/Sidebar'
import Appbar from '../nav/Appbar'

function AppLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(true)

  // Check screen size and set showSidebar
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 639) // md breakpoint is typically 768px
    }

    handleResize() // Set initial value
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  AppLayout.propTypes = {
    children: PropTypes.node,
  }

  return (
    <div className={`flex ${!showSidebar && 'flex-col'} h-screen w-screen`}>
      {showSidebar && <Sidebar />}
      {!showSidebar && <Appbar />}
      {children}
    </div>
  )
}

export default AppLayout
