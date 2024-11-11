import { Button } from '@nextui-org/button'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-content2 w-full  mx-auto px-4 py-28 gap-5 md:px-8">
      <div className="max-w-screen-xl flex flex-col justify-between items-center">
        <h5 className="font-medium">#LFG</h5>

        <Button as={Link} to="/" color="default" variant="light" size="sm">
          Docs
        </Button>
      </div>
    </footer>
  )
}

export default Footer
