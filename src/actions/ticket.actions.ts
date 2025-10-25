"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/utils/sentry";

export async function createTicket(
  previousState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
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
    const tickets = await prisma.ticket.findMany({
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