import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from '@nextui-org/react'
import { Link } from 'react-router-dom'
import { RiHome2Line, RiExpandUpDownLine } from 'react-icons/ri'
import { useUser } from '../../hooks/react-query/user/useUser'
import { useLogout } from '../../hooks/react-query/user/useUser'

function Sidebar() {
  const { data: user } = useUser()
  const { mutateAsync: logoutUser } = useLogout()

  const ICON_SIZE = 24

  const navItems = [
    {
      name: 'Home',
      path: '/dashboard',
      startContent: <RiHome2Line fontSize={ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'About',
      path: '/',
      startContent: <RiHome2Line fontSize={ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'Contact',
      path: '/',
      startContent: <RiHome2Line fontSize={ICON_SIZE} />,
      endContent: null,
    },
  ]

  const userItems = [
    {
      name: 'Profile',
      path: '/',
      startContent: <RiHome2Line fontSize={ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'Settings',
      path: '/',
      startContent: <RiHome2Line fontSize={ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'Logout',
      action: handleLogout,
      startContent: <RiHome2Line fontSize={ICON_SIZE} />,
      endContent: null,
    },
  ]

  async function handleLogout() {
    await logoutUser()
  }

  console.log(user)

  return (
    <div className="basis-72 grow-0 shrink-0 h-screen bg-default-50 p-6 flex flex-col justify-between">
      <nav className="w-full flex flex-col gap-1">
        <div className="mb-9">Logo</div>
        {navItems.map((route, index) => (
          <Button
            as={Link}
            key={index}
            to={route.path}
            startContent={route?.startContent}
            className="items-center justify-start "
            color="default"
            variant="light"
          >
            {route.name}
          </Button>
        ))}
      </nav>
      <Dropdown>
        <DropdownTrigger>
          <User
            as={Button}
            variant="light"
            size="lg"
            className="justify-between"
            endContent={<RiExpandUpDownLine fontSize={ICON_SIZE - 6} />}
            name={user?.data?.name || 'User'}
            description={user?.email || 'email'}
            avatarProps={{
              src: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            }}
          />
        </DropdownTrigger>
        <DropdownMenu>
          {userItems.map((route, index) => (
            <DropdownItem
              as={Link}
              key={index}
              to={route.path || ''}
              onClick={route.action && route.action}
              startContent={route?.startContent}
              className="items-center justify-start "
              color="default"
              variant="light"
            >
              {route.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default Sidebar
