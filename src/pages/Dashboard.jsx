import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
  Progress,
} from '@nextui-org/react'
import AppLayout from '../components/layout/AppLayout'
import PageLayout from '../components/layout/PageLayout'
import DropzoneUpload from '../components/files/DropzoneUpload'
import { RiAddLine } from 'react-icons/ri'
import Papa from 'papaparse'
import { useTeams } from '../hooks/react-query/teams/useTeams'
import {
  useEmailLists,
  useCreateEmailList,
} from '../hooks/react-query/email-lists/useEmailLists'

function DashboardPage() {
  const { data: teams } = useTeams()
  const teamId = teams?.teams[0]?.$id

  const { data: emailLists, isPending, isLoading } = useEmailLists(teamId)
  const { mutateAync: createEmailList } = useCreateEmailList()

  async function handleParse(data) {
    // save file name without extension
    const fileName = data?.fileName?.split('.')[0]

    // save list to db
    await createEmailList({
      name: fileName,
      teamId: teamId,
    })

    // Parse the CSV
    Papa.parse(data?.fileContent, {
      header: true,
      complete: (results) => {
        const firstRow = results.data[0] // Access the first row of parsed data

        // Use a regular expression to match email addresses
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        // Find the key that contains an email address
        let emailColumn = null
        for (const key in firstRow) {
          if (emailRegex.test(firstRow[key])) {
            emailColumn = key
            break
          }
        }

        if (emailColumn) {
          console.log(`Email column identified: ${emailColumn}`)
          // save list to db
          // then saver emails to db
          // then trigger validation
        } else {
          console.log('No email column found')
        }
      },
    })
  }
  return (
    <AppLayout>
      <PageLayout
        title="Email lists"
        primaryAction="New list"
        icon={<RiAddLine fontSize="1.1rem" />}
        onClick={() => console.log('clicked')}
      >
        <Table aria-label="Email lists">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>SIZE</TableColumn>
            <TableColumn>Overview</TableColumn>
            <TableColumn>STATUS</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isPending}
            loadingContent={<Spinner label="Loading..." />}
            emptyContent={<DropzoneUpload onUpload={handleParse} />}
          >
            {emailLists?.map((list) => (
              <TableRow key={list.$id}>
                <TableCell className="min-w-[100px] max-w-[120px] whitespace-nowrap text-ellipsis overflow-hidden">
                  {list?.name}
                </TableCell>
                <TableCell>2</TableCell>
                <TableCell>
                  <Progress />
                </TableCell>
                <TableCell>{list?.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageLayout>
    </AppLayout>
  )
}

export default DashboardPage
