import { Button } from '@nextui-org/react'
import { useState } from 'react'
import { useDarkMode } from '../../hooks/theme/useDarkMode'
import { RiSunLine, RiMoonClearLine } from 'react-icons/ri'

export default function ThemeSwitcher() {
  const [darkMode, setDarkMode] = useDarkMode()
  const [icon, setIcon] = useState(<RiMoonClearLine />)

  const handleClick = () => {
    setDarkMode(!darkMode)
    setIcon(darkMode ? <RiSunLine /> : <RiMoonClearLine />)
  }

  return (
    <Button isIconOnly variant="light" onClick={handleClick}>
      {icon}
    </Button>
  )
}
