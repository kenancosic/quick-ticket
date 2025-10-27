import { getTickets } from '@/actions/ticket.actions'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/current-user'
import { redirect } from 'next/navigation'
import TicketItem from '@/components/TicketItem'

const TicketsPage = async () => {

  const user = await getCurrentUser();

  if(!user){
    redirect("/login");
  }
  const tickets = await getTickets();

  return (
    <div className='min-h-screen bg-blue-50 px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-4 text-blue-600'>Support Tickets</h1>
          <p className='text-gray-600 text-lg'>Manage and track your support requests</p>
        </div>

        <div className='flex justify-center mb-8'>
          <Link
            href={'/tickets/new'}
            className='bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 font-semibold'
          >
            Create New Ticket
          </Link>
        </div>

        <div className='space-y-4'>
          {tickets.length === 0 ? (
            <div className='text-center py-12'>
              <div className='bg-white rounded-lg shadow-md p-8 border border-gray-200'>
                <h3 className='text-xl font-semibold text-gray-600 mb-2'>No tickets found</h3>
                <p className='text-gray-500'>Get started by creating your first support ticket.</p>
              </div>
            </div>
          ) : (
            <div className='grid gap-4'>
              {tickets.map((ticket) => (
                <TicketItem key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketsPage