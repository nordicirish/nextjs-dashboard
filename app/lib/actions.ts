'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
//   change amount from a string to a number while also validating its type.
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
// omit id and date fields 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
//   store monetary values in cents in the database to eliminate JavaScript floating-point errors and ensure greater accuracy
    const amountInCents = amount * 100;
    // create a new date with the format "YYYY-MM-DD" for the invoice's creation date
    const date = new Date().toISOString().split('T')[0];
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
}

  