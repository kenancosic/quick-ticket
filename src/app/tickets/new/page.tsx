import NewTicketForm from './ticket-form'

const NewTicketPage = () => {
  return (
    <div className='min-h-screen bg-blue-50 px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-4 text-blue-600'>Submit Support Ticket</h1>
          <p className='text-gray-600 text-lg'>Describe your issue and we&apos;ll get back to you soon</p>
        </div>

        <div className='flex justify-center'>
          <div className='w-full max-w-md'>
            <NewTicketForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewTicketPage