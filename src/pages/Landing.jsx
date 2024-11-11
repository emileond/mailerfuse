import { Button } from '@nextui-org/react'
import Faq from '../components/marketing/Faq'
import Feature from '../components/marketing/Feature'
import FeaturesGrid from '../components/marketing/FeaturesGrid'
import Footer from '../components/marketing/Footer'
import Hero from '../components/marketing/Hero'
import NavBar from '../components/marketing/Nav'
import Paywall from '../components/marketing/Paywall'
import Pricing from '../components/marketing/Pricing'
import UseCases from '../components/marketing/UseCases'

function LandingPage() {
  return (
    <div className="bg-content1">
      <NavBar />
      <Hero />
      <Feature
        heading="Validate Emails in Bulk"
        description="Improve email deliverability and start maintaining a healthier mailing list with just a few clicks."
        ctaText="Get started"
      />
      <FeaturesGrid />
      <UseCases />
      <Pricing />
      <Faq />
      <Paywall trigger={<Button>Open</Button>} feature="Custom Domains" />
      <Footer />
    </div>
  )
}

export default LandingPage
