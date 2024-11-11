import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button, ButtonGroup, Chip } from '@nextui-org/react'
import PricingCard from './PricingCard'
import VolumePricingCard from './VolumePricingCard'

function Pricing({ volumePricing = false }) {
  Pricing.propTypes = {
    volumePricing: PropTypes.bool.isRequired,
  }
  const [isYearly, setIsYearly] = useState(true)

  const plans = [
    {
      name: 'Basic',
      price: 19,
      yearlyPrice: 152,
      features: ['500 GB Storage', '2 Users Allowed', 'Send up to 3 GB'],
    },
    {
      name: 'Pro',
      price: 19,
      yearlyPrice: 249,
      features: ['500 GB Storage', '2 Users Allowed', 'Send up to 3 GB'],
      highlight: true,
    },
    {
      name: 'Business',
      price: 19,
      yearlyPrice: 499,
      features: ['500 GB Storage', '2 Users Allowed', 'Send up to 3 GB'],
    },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto py-32 px-6 flex flex-col gap-9">
      <h2 className="text-3xl font-bold text-center mb-3">
        Simple, transparent pricing
      </h2>
      {volumePricing ? (
        <VolumePricingCard />
      ) : (
        <>
          <ButtonGroup size="sm">
            <Button
              color={isYearly ? 'primary' : 'default'}
              variant={isYearly ? 'flat' : 'faded'}
              endContent={
                <Chip size="sm" color="primary">
                  Save 20%
                </Chip>
              }
              onClick={() => setIsYearly(true)}
            >
              Yearly
            </Button>
            <Button
              color={isYearly ? 'default' : 'primary'}
              variant={isYearly ? 'faded' : 'flat'}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </Button>
          </ButtonGroup>
          <div className="w-full flex flex-wrap gap-6">
            {plans.map((plan, index) => (
              <PricingCard
                key={index}
                name={plan?.name}
                price={plan?.price}
                yearlyPrice={plan?.yearlyPrice}
                isYearly={isYearly}
                features={plan?.features}
                highlight={plan?.highlight}
              />
            ))}
          </div>
        </>
      )}

      <p className="text-center text-sm text-default-500">
        All prices are in USD.
      </p>
    </div>
  )
}

export default Pricing
