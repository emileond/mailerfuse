import { cloneElement } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react'
import { RiVipCrownFill } from 'react-icons/ri'
import PricingPlans from './PricingPlans'
import VolumePricingCard from './VolumePricingCard'
import { Link } from 'react-router-dom'

function Paywall({ trigger, feature, volumePricing = false }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  // Clone the trigger element and add the onClick handler
  const TriggerElement = cloneElement(trigger, {
    onClick: onOpen,
  })

  return (
    <>
      {TriggerElement}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        scrollBehavior="inside"
        className="p-3"
      >
        <ModalContent>
          <ModalHeader>
            <div className="w-full text-center">
              <span className="text-sm inline-flex gap-1 items-center text-default-600 mb-3">
                <RiVipCrownFill className="text-md text-warning-500" /> Upgrade
                to use this feature
              </span>
              <h2 className="text-2xl font-bold">
                Get the most out of {import.meta.env.VITE_APP_NAME} with{' '}
                {feature}
              </h2>
            </div>
          </ModalHeader>
          <ModalBody>
            {volumePricing ? <VolumePricingCard /> : <PricingPlans />}
          </ModalBody>
          <ModalFooter>
            <div className="w-full text-center">
              <Link to="#" className="font-medium text-blue-500">
                Compare plans
              </Link>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Paywall
