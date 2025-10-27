"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/utils/sentry";
import { getCurrentUser } from "@/lib/current-user";

export async function createTicket(
  previousState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getCurrentUser();
    
    if(!user){
      logEvent(
        "Unauthorized creation of ticket attempt",
        "ticket",
        {formData: Object.fromEntries(formData.entries())},
        "warning"
      );
      return { success: false, message: "Unauthorized" };
    }

    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;


    if (!subject || !description || !priority) {
      logEvent(
        "Validation Error: missing ticket fields",
        "ticket",
        {subject, description, priority},
        "warning"
      );
      return { success: false, message: "All fields are required" };
    }

    //Create ticket
    const ticket = await prisma.ticket.create({
        data: {
            subject,
            description,
            priority,
            user: {
                connect: {
                    id: user.id
                }
            }
        }
    });
    
    logEvent(
      `Ticket created successfully: ${ticket.id}`,
      "ticket",
      {ticketId: ticket.id},
      "info"
    )

    revalidatePath("/tickets");

    return { success: true, message: "Ticket created successfully" };
  } catch (error) {
    logEvent(
      "An error occured while creating ticket",
      "ticket",
      {formData: Object.fromEntries(formData.entries())},
      "error",
      error
    );
    return { success: false, message: "Failed to create ticket" };
  }
}

export async function getTickets() {
  try {
    const user = await getCurrentUser();

    if(!user){
      logEvent(
        "Unauthorized fetch of tickets attempt",
        "ticket",
        {},
        "warning"
      );
      return [];
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: user.id
      },
      orderBy: { createdAt: "desc" },
    });

    logEvent(
      "Fetched tickets successfully",
      "ticket",
      { count: tickets.length },
      "info"
    );
    return tickets;
  } catch (error) {
    logEvent(
      "An error occured while fetching tickets",
      "ticket",
      {},
      "error",
      error
    );
    return [];
  }
}

export async function getTicketById(id: string) {
  try {
    const ticket  = await prisma.ticket.findUnique({
      where: {
        id: Number(id)
      }
    });

    if(!ticket){
      logEvent(
        `Ticket not found: ${id}`,
        "ticket",
        {ticketId: id},
        "warning"
      );
      return null;
    }
    return ticket;
    
  } catch (error) {
    logEvent(
      "An error occured while fetching ticket",
      "ticket",
      {ticketId: id},
      "error",
      error
    );
    return null;
  }
}

//Close ticket
export async function closeTicket(prevState: { success: boolean; message: string }, formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const ticketId = Number(formData.get("ticketId"));
    
    if(!ticketId){
      logEvent(
        "Validation Error: missing ticket id",
        "ticket",
        {ticketId},
        "warning"
      );
      return { success: false, message: "Ticket id is required" };
    }
    const user = await getCurrentUser();

    if(!user){
      logEvent(
        "Unauthorized close of ticket attempt",
        "ticket",
        {ticketId},
        "warning"
      );

      return {success: false, message:"Unauthorized"}
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId
      }
    });

    if(!ticket || ticket.userId !== user.id){
      logEvent(
        `Unauthorized close of ticket attempt: ${ticketId}`,
        "ticket",
        {ticketId},
        "warning"
      );
      return {success: false, message:"Unauthorized"}
    }

    await prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        status: "closed"
      }
    });

    revalidatePath("/tickets");
    revalidatePath(`/tickets/${ticketId}`);
    
    return {success: true, message:"Ticket closed successfully"};
    
  } catch (error) {
    logEvent(
      "An error occured while closing ticket",
      "ticket",
      {},
      "error",
      error
    );
    return { success: false, message: "Failed to close ticket" };
  }
}