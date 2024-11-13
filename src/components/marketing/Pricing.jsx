import VolumePricingCard from './VolumePricingCard'
import PricingPlans from './PricingPlans'

function Pricing({ volumePricing = false }) {
  return (
    <div className="w-full max-w-5xl mx-auto py-32 px-6 flex flex-col gap-9">
      <h2 className="text-3xl font-bold text-center">
        Pay Only for What You Use
      </h2>
      {volumePricing ? <VolumePricingCard /> : <PricingPlans />}

      <p className="text-center text-sm text-default-500">
        All prices are in USD.
      </p>
    </div>
  )
}

export default Pricing
