import { Button } from '@nextui-org/button'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-content2 w-full px-4 py-16">
      <h5 className="font-medium text-center">
        {new Date().getFullYear()} &copy;{' '}
        <span className="text-secondary">Mailerfuse</span>
      </h5>
    </footer>
  )
}

export default Footer
