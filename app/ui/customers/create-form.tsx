'use client';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createCustomer } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useMessage } from '@/app/context/MessageContext';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function Form() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createCustomer, initialState);
  const { addMessage } = useMessage();

  useEffect(() => {
    if (state.success && state.result?.message) {
      addMessage(state.result.message, 'success');
      // Ensure redirect happens only once
      redirect('/dashboard/customers');
    }
  }, [state.success, state.result?.message, addMessage]);

  // useEffect(() => {
  //   if (state.errors) {
  //     // Only show error messages if there are errors
  //     if (state.message) {
  //       addMessage(state.message, 'error');
  //     }
  //   }
  // }, [state.errors, state.message, addMessage]);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900"
          >
            Name
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            aria-describedby="name-error"
            placeholder="Enter the customer name"
          />
        </div>
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        {/* Customer Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            aria-describedby="email-error"
            placeholder="Enter the customer email"
          />
        </div>
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {state.errors?.email &&
            state.errors.email.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-900"
          >
            Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            className="mt-1 block w-full"
            aria-describedby="image-error"
          />
        </div>
        <div id="image-error" aria-live="polite" aria-atomic="true">
          {state.errors?.image &&
            state.errors.image.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/customers"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit">Create Customer</Button>
        </div>
      </div>
    </form>
  );
}
