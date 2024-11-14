import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
  Progress,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
} from '@nextui-org/react'
import AppLayout from '../components/layout/AppLayout'
import PageLayout from '../components/layout/PageLayout'
import DropzoneUpload from '../components/files/DropzoneUpload'
import { RiAddLine, RiMore2Fill, RiDeleteBin6Line } from 'react-icons/ri'
import useCurrentWorkspace from '../hooks/useCurrentWorkspace'
import Papa from 'papaparse'
import {
  useEmailLists,
  useDeleteEmailList,
} from '../hooks/react-query/email-lists/useEmailLists'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import ky from 'ky'
import { supabaseClient } from '../lib/supabase'
import toast from 'react-hot-toast'

function DashboardPage() {
  const [currentWorkspace] = useCurrentWorkspace()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: emailLists,
    isPending,
    isFetching,
  } = useEmailLists(currentWorkspace)
  const { mutateAsync: deleteEmailList } = useDeleteEmailList(currentWorkspace)

  async function handleDelete(listId) {
    await deleteEmailList({ listId })
  }

  async function handleParse(data) {
    // save file name without extension
    const fileName = data?.fileName?.split('.')[0]

    // Parse the CSV
    Papa.parse(data?.fileContent, {
      header: true,
      complete: async (results) => {
        const data = results.data
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
          try {
            const { data: session } = await supabaseClient.auth.getSession()
            await ky
              .post('/api/save-list', {
                json: {
                  fileName,
                  data,
                  emailColumn,
                  workspace_id: currentWorkspace?.workspace_id,
                  session: session?.session,
                },
              })
              .json()
          } catch (error) {
            console.log(error)
            if (error.response) {
              // If you want to inspect the response details (e.g., status code)
              const errorData = await error.response.json()

              // Example: Check for custom error code
              if (errorData.error_code === 'INSUFFICIENT_CREDITS') {
                toast('Not enough credits', {
                  type: 'error',
                  duration: 5000,
                })
              }
            }
          }
          await queryClient.invalidateQueries({
            queryKey: ['emailLists', currentWorkspace?.workspace_id],
          })
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
        <Table
          aria-label="Email lists"
          onRowAction={(key) => navigate(`/lists/${key}`)}
          selectionMode="single"
        >
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>SIZE</TableColumn>
            <TableColumn>Overview</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn hideHeader>Action</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isPending || isFetching}
            loadingContent={<Spinner label="Loading..." />}
            emptyContent={<DropzoneUpload onUpload={handleParse} />}
          >
            {emailLists?.map((list) => (
              <TableRow key={list.id} className="cursor-pointer">
                <TableCell className="min-w-[100px] max-w-[120px] whitespace-nowrap text-ellipsis overflow-hidden">
                  {list?.name}
                </TableCell>
                <TableCell>{list?.size}</TableCell>
                <TableCell>
                  <Progress />
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="w-[56px]">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" isIconOnly>
                        <RiMore2Fill fontSize="1.1rem" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<RiDeleteBin6Line fontSize="1.1rem" />}
                        onClick={() => handleDelete(list?.id)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageLayout>
    </AppLayout>
  )
}

export default DashboardPage
