"use server";

export async function createTicket(
  previousState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;

  return { success: true, message: "Ticket created successfully" };
}
