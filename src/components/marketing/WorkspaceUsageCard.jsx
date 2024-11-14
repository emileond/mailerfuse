import { Card, CardBody, Button, Progress } from '@nextui-org/react'
import { Link } from 'react-router-dom'
import useCurrentWorkspace from '../../hooks/useCurrentWorkspace'
import { useWorkspaceCredits } from '../../hooks/react-query/credits/useWorkspaceCredits'

function WorkspaceUsageCard() {
  const [currentWorkspace] = useCurrentWorkspace()
  const { data: credits } = useWorkspaceCredits(currentWorkspace)

  return (
    <Card shadow="none" isPressable className="hover:bg-content2">
      <CardBody>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">
            {credits?.total_credits - credits?.used_credits} credits
          </span>
          <Button
            as={Link}
            to="/pricing"
            size="sm"
            color="secondary"
            variant="light"
            className="p-1 font-semibold"
          >
            Get more
          </Button>
        </div>
        <Progress
          size="sm"
          color="success"
          minValue={0}
          maxValue={credits?.total_credits}
          value={credits?.total_credits - credits?.used_credits}
        />
      </CardBody>
    </Card>
  )
}

export default WorkspaceUsageCard
