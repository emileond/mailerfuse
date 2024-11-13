import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from '@nextui-org/react'
import AppLayout from '../components/layout/AppLayout'
import PageLayout from '../components/layout/PageLayout'
import DropzoneUpload from '../components/files/DropzoneUpload'
import { RiAddLine } from 'react-icons/ri'
import Papa from 'papaparse'
import { databases, ID } from '../lib/appwrite'
import { useUser } from '../hooks/react-query/user/useUser'

function DashboardPage() {
  const { data: user } = useUser()

  console.log('usr', user)
  async function saveList(fileName) {
    const savedList = await databases.createDocument(
      '672b9b260032fe4d52ef',
      '672c0483001ea19aa498',
      ID.unique(),
      {
        name: fileName,
        status: 'pending',
      }
    )

    console.log(savedList)
  }

  async function handleParse(data) {
    // save file name without extension
    const fileName = data?.fileName?.split('.')[0]

    // save list to db
    await saveList(fileName)

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
        <DropzoneUpload onUpload={handleParse} />
        <Table aria-label="Example static collection table">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>ROLE</TableColumn>
            <TableColumn>STATUS</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow key="1">
              <TableCell>Tony Reichert</TableCell>
              <TableCell>CEO</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow key="2">
              <TableCell>Zoey Lang</TableCell>
              <TableCell>Technical Lead</TableCell>
              <TableCell>Paused</TableCell>
            </TableRow>
            <TableRow key="3">
              <TableCell>Jane Fisher</TableCell>
              <TableCell>Senior Developer</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow key="4">
              <TableCell>William Howard</TableCell>
              <TableCell>Community Manager</TableCell>
              <TableCell>Vacation</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </PageLayout>
    </AppLayout>
  )
}

export default DashboardPage
