import PropTypes from 'prop-types'
import VolumePricingCard from './VolumePricingCard'
import PricingPlans from './PricingPlans'

function Pricing({ volumePricing = false }) {
  Pricing.propTypes = {
    volumePricing: PropTypes.bool.isRequired,
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-32 px-6 flex flex-col gap-9">
      <h2 className="text-3xl font-bold text-center mb-3">
        Simple, transparent pricing
      </h2>
      {volumePricing ? <VolumePricingCard /> : <PricingPlans />}

      <p className="text-center text-sm text-default-500">
        All prices are in USD.
      </p>
    </div>
  )
}

export default Pricing
