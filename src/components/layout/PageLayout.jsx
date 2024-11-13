import { Button } from '@nextui-org/react'
import { useNavigate } from 'react-router-dom'
import { RiArrowLeftLine } from 'react-icons/ri'

function PageLayout({
  children,
  maxW = '6xl',
  title = 'Page',
  primaryAction = 'Click me',
  icon,
  onClick,
  backBtn,
}) {
  const navigate = useNavigate()

  function handleOnclick() {
    if (onClick) {
      return onClick()
    }
  }

  return (
    <div className={`bg-content1 p-6 grow flex justify-center`}>
      <div className={`w-full max-w-${maxW} flex flex-col gap-6 `}>
        <div className="w-full flex justify-between gap-3">
          <div className="flex gap-3">
            {backBtn && (
              <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
                <RiArrowLeftLine fontSize="1.2rem" />
              </Button>
            )}
            <h1 className="font-semibold">{title}</h1>
          </div>
          <Button
            onClick={handleOnclick}
            color="primary"
            className="font-medium"
            startContent={icon}
          >
            {primaryAction}
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default PageLayout
