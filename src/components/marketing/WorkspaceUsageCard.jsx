import { Card, CardBody, Progress } from '@nextui-org/react'
import useCurrentWorkspace from '../../hooks/useCurrentWorkspace'
import { useWorkspaceCredits } from '../../hooks/react-query/credits/useWorkspaceCredits'
import Paywall from './Paywall'
import { useState } from 'react'

function WorkspaceUsageCard() {
  const [currentWorkspace] = useCurrentWorkspace()
  const { data: credits } = useWorkspaceCredits(currentWorkspace)

  const [isPaywallOpen, setIsPaywallOpen] = useState(false)

  return (
    <>
      <Card
        shadow="none"
        isPressable
        className="hover:bg-content2"
        onPress={() => setIsPaywallOpen(true)}
      >
        <CardBody>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">
              {Intl.NumberFormat('en-US').format(credits?.available_credits)}{' '}
              credits
            </span>
            <p className="p-1 font-semibold text-secondary text-sm">Get more</p>
          </div>
          <Progress
            size="sm"
            color="success"
            minValue={0}
            maxValue={25000}
            value={credits?.available_credits}
          />
        </CardBody>
      </Card>
      <Paywall
        hideTitle
        isOpen={isPaywallOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsPaywallOpen(false)
          }
        }}
        feature="more credits"
      />
    </>
  )
}

export default WorkspaceUsageCard
