"use client";
import { useActionState, useEffect } from "react";
import { closeTicket } from "@/actions/ticket.actions";
import { toast } from "sonner";
import type { Ticket } from "@/generated/prisma/client";

const CloseTicketButton = ({ ticketId, isClosed }: { ticketId: number, isClosed: boolean }) => {
  const initialState = {
    success: false,
    message: ""
  }
  
  const [state, formAction] = useActionState(closeTicket, initialState);

  if(isClosed){
    return null;
  }

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}> 
      <input type="hidden" name="ticketId" value={ticketId} value={ticketId} />
      <button type="submit">Close Ticket</button>
    </form>
  );
}

export default CloseTicketButton