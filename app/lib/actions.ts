'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { put } from '@vercel/blob';
import { insertCustomer } from './data';

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  //   change amount from a string to a number while also validating its type.

  amount: z.coerce
    .number()
    // greater than checks if the value is greater than 0
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// Use Zod to validate the expected types
const CustomerFormSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({
    message: 'Please enter a valid email address for the customer.',
  }),
  // image_url: z.string(),
  image: z
    .instanceof(File, { message: 'An image file is required.' })
    .refine((file) => file.size > 0, {
      // Ensure the file size is greater than 0
      message: 'An image file is required.',
    })
    .refine((file) => file.size < 5 * 1024 * 1024, {
      // Ensure the file size is less than 5MB
      message: 'Please upload an image less than 5MB.',
    }),
});
// omit id and date fields
const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
// Use Zod to update the expected types
const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
const CreateCustomer = CustomerFormSchema.omit({ id: true });
// omit image_url and image fields from the expected types until image updating is implemented
const UpdateCustomer = CustomerFormSchema.omit({
  id: true,
  image: true,
});

// Error state types for forms
export type InvoiceState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export type CustomerState = {
  // form validation errors
  errors?: {
    name?: string[];
    email?: string[];
    image?: string[];
  };
  message?: string | null;
  // form submission result and success status
  success?: boolean;
  result?: {
    message?: string;
    errors?: {
      name?: string[];
      email?: string[];
      image?: string[];
    };
  };
};
//connect the auth logic with your login form
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
async function uploadImage(image: File): Promise<string> {
  try {
    const blob = await put(image.name, image, { access: 'public' });
    const image_url = blob.url;
    console.log('Blob URL:', image_url);
    return image_url;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error('Image upload failed');
  }
}

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
): Promise<CustomerState> {
  // Parse and validate form data
  const validatedFields = CreateCustomer.safeParse({
    id: formData.get('id'),
    name: formData.get('username'),
    email: formData.get('email'),
    image: formData.get('image'),
  });

  if (!validatedFields.success) {
    // Extract field errors from validation error
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      success: false,
      errors,
      message: 'Validation failed. Please correct the errors and try again.',
    };
  }

  const { name, email, image } = validatedFields.data;

  try {
    const image_url = await uploadImage(image);
    await insertCustomer(name, email, image_url);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      message: 'Error creating customer. Please try again.',
    };
  }

  // Revalidate the customer list
  revalidatePath('/dashboard/customers');
  revalidatePath('/dashboard/invoices');

  return {
    success: true,
    result: {
      message: `Customer ${name} created successfully!`,
    },
  };
}
export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData,
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  //   store monetary values in cents in the database to eliminate JavaScript floating-point errors and ensure greater accuracy
  const amountInCents = amount * 100;
  // create a new date with the format "YYYY-MM-DD" for the invoice's creation date
  const date = new Date().toISOString().split('T')[0];
  try {
    // insert the new invoice into the database
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: InvoiceState,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  console.log('validatedFields', validatedFields);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return { message: 'Database Error: Failed to update invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/invoices');
}

// action is being called in the /dashboard/invoices path, so don't need to call redirect. Calling revalidatePath will trigger a new server request and re-render the table
export async function deleteInvoice(id: string) {
  //to test error handling
  // throw new Error('Failed to Delete Invoice');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    //revalidate path inside the try block as no redirect is needed if successful
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    return { message: 'Database Error: Failed to delete invoice.' };
  }
}
export async function deleteCustomer(id: string, name: string) {
  try {
    console.log('Deleting customer with ID:', id);

    // Check if there are any pending invoices for the customer
    const { rows: pendingInvoices } = await sql`
      SELECT 1 as pending FROM invoices
      WHERE customer_id = ${id} AND status = 'pending'
    `;

    console.log(
      'Pending invoices check:',
      JSON.stringify(pendingInvoices, null, 2),
    );

    if (pendingInvoices.length > 0) {
      console.log('Cannot delete  due to pending invoices.');
      return {
        message: `Cannot delete  ${name} with pending invoices.`,
        error: true,
      };
    }

    // Delete all invoices associated with the customer
    await sql`
      DELETE FROM invoices
      WHERE customer_id = ${id}
    `;

    console.log('Deleted invoices for customer ID:', id);

    // Delete the customer
    await sql`
      DELETE FROM customers
      WHERE id = ${id}
    `;

    console.log('Deleted customer with ID:', id);

    // Revalidate paths
    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/invoices');

    // Redirect to dashboard/customers
    redirect('/dashboard/customers');
  } catch (error) {
    console.error('Error deleting customer:', error);
  }
  return {
    message: `Customer ${name} and their invoices successfully deleted.`,
  };
}

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    // image_url: formData.get('image_url'),
    // image: formData.get('image'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }
  const { name, email } = validatedFields.data;
  // const image = formData.get('image');
  // if (!(image instanceof File)) {
  //   return {
  //     message: 'Invalid image file.',
  //   };
  // }
  // try {
  //   const blob = await put(image.name, image, { access: 'public' });
  //   const image_url = blob.url;
  //   console.log('Blob URL:', image_url);
  try {
    await sql`
    UPDATE customers
    SET name = ${name}, email = ${email} 
    WHERE id = ${id}
  `;
  } catch (error) {
    return { message: 'Database Error: Failed to update customer.' };
  }
  // } catch (error: any) {
  //   console.error('Error editing customer:', error);
  //   throw error;
  // }
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}
