import { useParams } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import PageLayout from '../components/layout/PageLayout'

function ListDetailsPage() {
  const { id } = useParams()

  return (
    <AppLayout>
      <PageLayout backBtn>this is a details pagefor {id}</PageLayout>
    </AppLayout>
  )
}

export default ListDetailsPage
