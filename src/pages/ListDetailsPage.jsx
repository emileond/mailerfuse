import { useParams } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import PageLayout from '../components/layout/PageLayout'
import useCurrentWorkspace from '../hooks/useCurrentWorkspace'
import { useEmailLists } from '../hooks/react-query/email-lists/useEmailLists'
import { Card, CardBody, CardHeader, Chip, Divider } from '@nextui-org/react'
import { PiFileCsvDuotone } from 'react-icons/pi'
import { useEffect, useState } from 'react'
import { RiCircleFill } from 'react-icons/ri'

function ListDetailsPage() {
  const [currentWorkspace] = useCurrentWorkspace()
  const { data } = useEmailLists(currentWorkspace)
  const { id } = useParams()
  const [list, setList] = useState(null)

  useEffect(() => {
    if (data && id) {
      const list = data.find((list) => list.id === id)
      setList(list)
    }
  }, [id, data])

  const getKeyColor = (key) => {
    switch (key) {
      case 'deliverable':
        return 'success'
      case 'undeliverable':
        return 'danger'
      case 'risky':
        return 'warning'
      default:
        return 'default-500'
    }
  }

  return (
    <AppLayout>
      <PageLayout
        backBtn
        maxW="3xl"
        title={list?.name || 'List Details'}
        primaryAction="Export"
      >
        <div className="w-full flex gap-6">
          <Card className="basis-1 grow">
            <CardHeader>Details</CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-3">
              <div className="w-full flex gap-3 justify-between">
                <div className="flex gap-2 items-center">
                  <PiFileCsvDuotone
                    fontSize="1.6rem"
                    className="text-default-600"
                  />
                  <span className="font-medium">{list?.name}</span>
                </div>
                <Chip
                  variant="flat"
                  color={
                    (list?.status === 'pending' && 'default') ||
                    (list?.status === 'processing' && 'primary') ||
                    (list?.status === 'completed' && 'success') ||
                    (list?.status === 'error' && 'danger')
                  }
                >
                  {list?.status}
                </Chip>
              </div>
              {list &&
                Intl.DateTimeFormat(navigator.language, {
                  dateStyle: 'short',
                }).format(new Date(list?.created_at))}
            </CardBody>
          </Card>
          <Card className="basis-1 grow">
            <CardHeader>Overview</CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-2">
              {list &&
                ['deliverable', 'risky', 'undeliverable', 'unknown'].map(
                  (key) => {
                    return (
                      <div key={key} className="flex gap-3 justify-between">
                        <div className="flex gap-2 items-center">
                          <RiCircleFill
                            className={`text-xs text-${getKeyColor(key)}`}
                          />
                          <span>{key}</span>
                        </div>
                        <span>{list?.summary[key]}</span>
                      </div>
                    )
                  }
                )}
            </CardBody>
          </Card>
        </div>
      </PageLayout>
    </AppLayout>
  )
}

export default ListDetailsPage
