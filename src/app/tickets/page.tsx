import { getTickets } from '@/actions/ticket.actions'
import { logEvent } from '@/utils/sentry'
import Link from 'next/link'
import { getPriorityClass } from '@/utils/priorityBadge'

const TicketsPage = async () => {
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
                <div key={ticket.id} className='bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition duration-200'>
                  <div className='flex justify-between items-start mb-3'>
                    <h2 className='text-xl font-semibold text-blue-600 flex-1'>{ticket.subject}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getPriorityClass(ticket.priority)
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className='text-gray-600 mb-3 line-clamp-2'>{ticket.description}</p>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col items-start space-x-4 text-sm text-gray-500'>
                      <span>Status: <span className='font-medium text-blue-600'>{ticket.status}</span></span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Link href={`/tickets/${ticket.id}`} className='text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200'>
                        View Details
                      </Link>
                      <span className='text-gray-300'>|</span>
                      <Link href={`/tickets/${ticket.id}/edit`} className='text-gray-500 hover:text-gray-700 text-sm font-medium transition duration-200'>
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketsPage