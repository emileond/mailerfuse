import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  User,
} from '@nextui-org/react'
import {
  RiSunLine,
  RiMoonClearLine,
  RiExpandUpDownLine,
  RiLogoutBoxRLine,
  RiQuestionLine,
  RiMegaphoneLine,
  RiUserLine,
} from 'react-icons/ri'
import { useDarkMode } from '../../hooks/theme/useDarkMode'
import { useUser } from '../../hooks/react-query/user/useUser'
import { useLogout } from '../../hooks/react-query/user/useUser'
import { Link } from 'react-router-dom'

function UserMenu({ avatarOnly }) {
  const [darkMode, setDarkMode] = useDarkMode()
  const { data: user } = useUser()
  const { mutateAsync: logoutUser } = useLogout()

  const USER_ICON_SIZE = 20
  const ICON_SIZE = 22

  async function handleLogout() {
    await logoutUser()
  }

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

  return (
    <Dropdown>
      <DropdownTrigger>
        {avatarOnly ? (
          <Avatar
            name={user?.data?.name || 'User'}
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            size="sm"
            className="cursor-pointer"
          />
        ) : (
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
        )}
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
  )
}

export default UserMenu
