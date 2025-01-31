import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/react"
import { Link } from 'react-router-dom'
import ThemeSwitcher from '../theme/ThemeSwitcher'
import { useUser } from '../../hooks/react-query/user/useUser'
import Logo from '../Logo'

export default function NavBar() {
  const { data: user } = useUser()
  const menuItems = [
    {
      name: 'Features',
      href: '#',
    },
    {
      name: 'Pricing',
      href: '#',
    },
    {
      name: 'Blog',
      href: '#',
    },
  ]
  return (
    <Navbar maxWidth="xl">
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link to="/">
            <Logo />
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        <NavbarBrand>
          <Link to="/">
            <Logo />
          </Link>
        </NavbarBrand>
        {menuItems.map((item, index) => (
          <NavbarItem key={index}>
            <Button as={Link} to={item.href} variant="light">
              {item.name}
            </Button>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        {user ? (
          <NavbarItem className="sm:flex">
            <Button
              as={Link}
              color="primary"
              to="/dashboard"
              variant="solid"
              className="sm:flex"
            >
              Dashboard
            </Button>
          </NavbarItem>
        ) : (
          <div className="flex gap-3">
            <NavbarItem className="sm:flex">
              <Button
                as={Link}
                color="default"
                to="/login"
                variant="light"
                className="sm:flex"
              >
                Login
              </Button>
            </NavbarItem>
            <NavbarItem className="sm:flex">
              <Button
                as={Link}
                color="primary"
                to="/signup"
                variant="solid"
                className="hidden sm:flex"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </div>
        )}
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              to={item.href}
              size="lg"
              color="foreground"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  )
}
