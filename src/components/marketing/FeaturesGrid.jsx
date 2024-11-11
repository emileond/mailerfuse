import { Card, CardBody, CardHeader } from '@nextui-org/react'
import {
  RiMegaphoneLine,
  RiArrowRightLine,
  RiPaletteLine,
  RiCodeSSlashFill,
  RiBriefcaseLine,
  RiRestaurantFill,
} from 'react-icons/ri'

function FeaturesGrid() {
  const ICON_SIZE = 40
  const features = [
    {
      icon: <RiCodeSSlashFill fontSize={ICON_SIZE} />,
      title: 'Delivery Verification',
      description:
        'Ensure the deliverability of an email address by connecting to the mail server.',
      color: 'text-yellow-500',
    },
    {
      icon: <RiMegaphoneLine fontSize={ICON_SIZE} />,
      title: 'Disposable Email Detection',
      description:
        'Guard against fleeting addresses. Spot and filter out temporary emails to maintain list integrity.',
      color: 'text-yellow-500',
    },
    {
      icon: <RiArrowRightLine fontSize={ICON_SIZE} />,
      title: 'Domain Validation',
      description:
        'Ensure that the domain hosting the email address exists and is working properly.',
      color: 'text-blue-500',
    },
    {
      icon: <RiArrowRightLine fontSize={ICON_SIZE} />,
      title: 'Syntax Validation',
      description:
        'Perfect formatting every time. Ensure email addresses adhere to standard structures for flawless delivery.',
      color: 'text-blue-500',
    },
    {
      icon: <RiPaletteLine fontSize={ICON_SIZE} />,
      title: 'Role Detection',
      description:
        'Identify role-based email addresses that do not belong to a person, but rather a group of people.',
      color: 'text-orange-500',
    },
    {
      icon: <RiBriefcaseLine fontSize={ICON_SIZE} />,
      title: 'Email Quality Score',
      description:
        'Every email address on your list will get a quality score from 0 to 100.',
      color: 'text-blue-500',
    },
    {
      icon: <RiRestaurantFill fontSize={ICON_SIZE} />,
      title: 'Character Detection',
      description:
        'Identify email addresses with irregular character patterns.',
      color: 'text-orange-500',
    },
    {
      icon: <RiRestaurantFill fontSize={ICON_SIZE} />,
      title: 'Email Verification API',
      description:
        'Verify emails in real-time within your applications, ensuring clean communication every time.',
      color: 'text-orange-500',
    },
    {
      icon: <RiRestaurantFill fontSize={ICON_SIZE} />,
      title: 'Integration Options',
      description:
        'Verify emails from 50+ apps including ActiveCampaign, Brevo, HubSpot, Mailchimp, Salesforce and many more integrations.',
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto py-32">
      <h2 className="text-3xl font-bold text-center mb-8">
        Comprehensive email validation tools at your fingertips
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="flex h-full p-3" shadow="none">
            <CardHeader className="flex flex-col items-start gap-3">
              <span className="text-secondary">{feature.icon}</span>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
            </CardHeader>
            <CardBody>
              <p className="text-foreground-500">{feature.description}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default FeaturesGrid
