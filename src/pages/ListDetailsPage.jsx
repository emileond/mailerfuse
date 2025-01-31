import { useParams } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import PageLayout from '../components/layout/PageLayout'
import useCurrentWorkspace from '../hooks/useCurrentWorkspace'
import { useEmailLists } from '../hooks/react-query/email-lists/useEmailLists'
import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react"
import { PiFileCsvDuotone } from 'react-icons/pi'
import { useEffect, useState } from 'react'
import { RiCircleFill } from 'react-icons/ri'
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts'
import ExportBtn from '../components/lists/ExportListBtn'

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
        customElements={
          <ExportBtn list={list} variant="solid" size="md" color="primary" />
        }
      >
        <div className="w-full flex flex-col gap-6">
          <Card>
            <CardHeader className="text-default-600">Details</CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-3">
              <div className="w-full flex gap-3 justify-between font-medium">
                <div className="flex gap-2 items-center">
                  <PiFileCsvDuotone
                    fontSize="1.6rem"
                    className="text-default-600"
                  />
                  <span>{list?.name}</span>
                </div>
                <div className="flex gap-1 items-center text-sm">
                  <span className="text-default-500 ">Status:</span>
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
                <div className="flex gap-1 items-center text-sm">
                  <span className="text-default-500 ">Emails:</span>
                  {list && Intl.NumberFormat().format(list?.size)}
                </div>
                <div className="flex gap-1 items-center text-sm">
                  <span className="text-default-500">Date:</span>
                  {list &&
                    Intl.DateTimeFormat(navigator.language, {
                      dateStyle: 'short',
                    }).format(new Date(list?.created_at))}
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="text-default-600">Overview</CardHeader>
            <Divider />
            <CardBody>
              {list && (
                <div className="w-full flex gap-2 items-center justify-center">
                  {/* Chart */}
                  <ResponsiveContainer
                    className="[&_.recharts-surface]:outline-none basis-1/3"
                    height={200}
                    width="100%"
                  >
                    <PieChart>
                      <Tooltip
                        content={({ payload }) =>
                          payload?.[0] ? (
                            <div className="flex h-8 min-w-[120px] items-center gap-x-2 rounded-medium bg-background px-1 text-tiny shadow-small">
                              <div
                                className={`h-2 w-2 flex-none rounded-full bg-${getKeyColor(
                                  payload[0].name
                                )}`}
                              />
                              <span className="font-medium text-foreground">
                                {payload[0].name}
                              </span>
                              <span className="font-mono font-medium text-default-700">
                                {payload[0].value}
                              </span>
                            </div>
                          ) : null
                        }
                        cursor={false}
                      />
                      <Pie
                        animationDuration={1000}
                        animationEasing="ease"
                        data={[
                          'deliverable',
                          'risky',
                          'undeliverable',
                          'unknown',
                        ].map((key) => ({
                          name: key,
                          value: list.summary[key],
                        }))}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="68%"
                        outerRadius="90%"
                        strokeWidth={0}
                      >
                        {[
                          'deliverable',
                          'risky',
                          'undeliverable',
                          'unknown',
                        ].map((key, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(var(--heroui-${getKeyColor(key)}-400`}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* List */}
                  <div className="flex flex-col basis-1/3">
                    {['deliverable', 'risky', 'undeliverable', 'unknown'].map(
                      (key) => (
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
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </PageLayout>
    </AppLayout>
  )
}

export default ListDetailsPage
