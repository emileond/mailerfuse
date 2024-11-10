import PropTypes from 'prop-types'
import { Button } from '@nextui-org/react'

function PageLayout({ children, maxW = '6xl' }) {
  PageLayout.propTypes = {
    children: PropTypes.node,
    maxW: PropTypes.string,
  }
  return (
    <div className={`p-6 grow flex justify-center`}>
      <div className={`w-full max-w-${maxW} flex flex-col gap-6 `}>
        <div className="w-full flex justify-between gap-3">
          <h1 className="font-semibold">PageLayout</h1>
          <Button color="primary">Click me</Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default PageLayout
