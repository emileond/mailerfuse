import { Button, Card, CardBody, Divider, Progress } from '@nextui-org/react'
import { Link, useLocation } from 'react-router-dom'
import Logo from '../Logo'
import { navItems } from './navItems'
import UserMenu from './UserMenu'

function Sidebar() {
  const location = useLocation()

  return (
    <div className="basis-64 grow-0 shrink-0 h-screen bg-content1 p-6 flex flex-col justify-between border-r-1 border-default-200">
      <nav className="w-full flex flex-col items-start gap-1">
        <div className="px-6 mb-6">
          <Logo />
        </div>
        {navItems.map((route, index) => {
          const isActive = route.path === location.pathname

          return (
            <Button
              as={Link}
              key={index}
              to={route.path}
              startContent={route?.startContent}
              className={`items-center justify-start w-full ${
                !isActive && 'text-default-600'
              }`}
              size="lg"
              color={isActive ? 'primary' : 'default'}
              variant={isActive ? 'flat' : 'light'}
            >
              {route.name}
            </Button>
          )
        })}
      </nav>
      <div className="flex flex-col gap-6">
        <Divider />
        <Card shadow="none" className="b">
          <CardBody>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Plan</span>
              <Button
                as={Link}
                to="/pricing"
                size="sm"
                color="secondary"
                variant="light"
                className="p-1 font-semibold"
              >
                Upgrade
              </Button>
            </div>
            <Progress size="sm" value={50} color="secondary" />
          </CardBody>
        </Card>
        <UserMenu />
      </div>
    </div>
  )
}

export default Sidebar
