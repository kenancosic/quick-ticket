import type { Ticket } from '@/generated/prisma/client';
import React from 'react'
import Link from 'next/link'
import { getPriorityClass } from '@/utils/priorityBadge'

type TicketItemProps = {
  ticket: Ticket;
}

const TicketItem = ({ ticket }: TicketItemProps) => {
  return (
      <div key={ticket.id} className='bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition duration-200'>
        <div className='flex justify-between items-start mb-3'>
          <h2 className='text-xl font-semibold text-blue-600 flex-1'>{ticket.subject}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(ticket.priority)
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
  )
}

export default TicketItem