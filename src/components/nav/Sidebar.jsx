import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Progress,
  User,
} from '@nextui-org/react'
import { Link, useLocation } from 'react-router-dom'
import {
  RiSunLine,
  RiMoonClearLine,
  RiMailSendLine,
  RiMailCheckLine,
  RiExpandUpDownLine,
  RiTerminalBoxLine,
  RiGroupLine,
  RiSettingsLine,
  RiLogoutBoxRLine,
  RiQuestionLine,
  RiMegaphoneLine,
  RiUserLine,
} from 'react-icons/ri'
import { useUser } from '../../hooks/react-query/user/useUser'
import { useLogout } from '../../hooks/react-query/user/useUser'
import Logo from '../Logo'
import { useDarkMode } from '../../hooks/theme/useDarkMode'

function Sidebar() {
  const [darkMode, setDarkMode] = useDarkMode()
  const location = useLocation()
  const { data: user } = useUser()
  const { mutateAsync: logoutUser } = useLogout()

  const ICON_SIZE = 22
  const USER_ICON_SIZE = 20

  const navItems = [
    {
      name: 'Bulk',
      path: '/dashboard',
      startContent: <RiMailSendLine fontSize={ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'Single',
      path: '/',
      startContent: <RiMailCheckLine fontSize={ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'API',
      path: '/',
      startContent: <RiTerminalBoxLine fontSize={ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'Team',
      path: '/team',
      startContent: <RiGroupLine fontSize={ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'Settings',
      path: '/settings',
      startContent: <RiSettingsLine fontSize={ICON_SIZE} />,
      endContent: null,
    },
  ]

  const userItems = [
    {
      name: 'Profile',
      path: '/',
      startContent: <RiUserLine fontSize={USER_ICON_SIZE} />,
      endContent: null,
    },
    {
      name: 'Log Out',
      action: handleLogout,
      startContent: <RiLogoutBoxRLine fontSize={USER_ICON_SIZE} />,
      endContent: null,
    },
  ]

  async function handleLogout() {
    await logoutUser()
  }

  return (
    <div className="basis-64 grow-0 shrink-0 h-screen bg-content1 p-6 flex flex-col justify-between border-r-1 border-default-200">
      <nav className="w-full flex flex-col items-start gap-1">
        <div className="px-6 mb-6">
          <Logo size="10" />
        </div>
        {navItems.map((route, index) => {
          const isActive = route.path === location.pathname

          return (
            <Button
              as={Link}
              key={index}
              to={route.path}
              startContent={route?.startContent}
              className="items-center justify-start w-full text-default-600"
              size="lg"
              color={isActive ? 'secondary' : 'default'}
              variant={isActive ? 'flat' : 'light'}
            >
              {route.name}
            </Button>
          )
        })}
      </nav>
      <div className="flex flex-col gap-6">
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
        <Dropdown>
          <DropdownTrigger>
            <User
              as={Button}
              variant="bordered"
              size="lg"
              className="justify-between px-3 border"
              endContent={<RiExpandUpDownLine fontSize={ICON_SIZE - 6} />}
              name={user?.data?.name || 'User'}
              description={user?.email || 'email'}
              avatarProps={{
                size: 'sm',
                src: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
              }}
            />
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownSection showDivider>
              <DropdownItem textValue="user">
                <User
                  name={user?.data?.name || 'User'}
                  description={user?.email || 'email'}
                  avatarProps={{
                    className: 'hidden',
                    src: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
                  }}
                />
              </DropdownItem>
            </DropdownSection>
            <DropdownSection showDivider>
              <DropdownItem
                startContent={<RiMegaphoneLine fontSize={USER_ICON_SIZE} />}
              >
                {`What's new`}
              </DropdownItem>
              <DropdownItem
                startContent={<RiQuestionLine fontSize={USER_ICON_SIZE} />}
              >
                Help
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem
                onClick={() => setDarkMode(!darkMode)}
                startContent={
                  darkMode ? (
                    <RiSunLine fontSize={USER_ICON_SIZE} />
                  ) : (
                    <RiMoonClearLine fontSize={USER_ICON_SIZE} />
                  )
                }
              >
                {darkMode ? 'Light' : 'Dark'} theme
              </DropdownItem>
              {userItems.map((route, index) => (
                <DropdownItem
                  as={route.path && Link}
                  key={index}
                  to={route.path}
                  onClick={route.action && route.action}
                  startContent={route?.startContent}
                  className="items-center justify-start"
                >
                  {route.name}
                </DropdownItem>
              ))}
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  )
}

export default Sidebar
