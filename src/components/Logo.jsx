import PropTypes from 'prop-types'
import logo from '/logo.svg'
import icon from '/icon.svg'

function Logo({ isIconOnly = false, size = '9' }) {
  Logo.propTypes = {
    isIconOnly: PropTypes.bool,
    size: PropTypes.string,
  }

  return (
    <img
      src={isIconOnly ? icon : logo}
      alt="logo"
      className={`h-${size} w-auto`} // Adjust the height and width as needed
    />
  )
}

export default Logo
