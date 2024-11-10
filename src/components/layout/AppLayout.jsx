import PropTypes from 'prop-types'
import Sidebar from '../nav/Sidebar'

function AppLayout({ children }) {
  AppLayout.propTypes = {
    children: PropTypes.node,
  }

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      {children}
    </div>
  )
}

export default AppLayout
