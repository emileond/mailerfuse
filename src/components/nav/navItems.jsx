import {
  RiMailSendLine,
  RiMailCheckLine,
  RiTerminalBoxLine,
  RiGroupLine,
  RiSettingsLine,
} from 'react-icons/ri'

const ICON_SIZE = '1.2rem'

export const navItems = [
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
