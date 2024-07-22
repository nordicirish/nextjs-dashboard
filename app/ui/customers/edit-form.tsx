'use client';

import {
  CheckIcon,
  PencilIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { Customer } from '@/app/lib/definitions';
import { updateCustomer } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import Image from 'next/image';
import { useMessage } from '@/app/context/MessageContext';
import RedirectOnSuccess from './RedirectOnSuccess';



export default function EditCustomerForm({ customer }: { customer: Customer }) {
  // use binding to create a new function that uses the same id for this
  // passing the id directly won't work because
  const initialState = { message: null, errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const [state, dispatch] = useFormState(updateCustomerWithId, initialState);
  const { addMessage } = useMessage();
 <RedirectOnSuccess
   success={state.success || false}
   resultMessage={state.result?.message || ''}
   addMessage={addMessage}
 />;

  return (
    <form action={dispatch}>
      <div className="flex flex-col items-center justify-center md:flex md:flex-row md:items-center md:justify-center">
        {/* Customer Image */}
        <div className="mb-4 text-center md:mb-0 md:mr-4 md:flex-shrink-0">
          {customer.image_url ? (
            <div className="mt-4">
              <Image
                src={customer.image_url}
                alt={`${customer.name}'s image`}
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
          ) : (
            <div className="mt-4">
              <UserCircleIcon className="h-16 w-16 text-gray-500" />
            </div>
          )}
        </div>

        {/* Customer Name */}
        <div className="w-full md:col-span-1 md:w-auto">
          <label
            htmlFor="name"
            className="mb-2 block text-center text-sm font-medium md:text-left"
          >
            Customer Name
          </label>
          <div className="relative mx-auto w-2/3 md:w-full">
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={customer.name}
              placeholder="Enter customer name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-center text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="name-error"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Customer Email */}
        <div className="mt-4 w-full md:col-span-1 md:mt-0 md:w-auto">
          <label
            htmlFor="email"
            className="mb-2 block text-center text-sm font-medium md:text-left"
          >
            Customer Email
          </label>
          <div className="relative mx-auto w-2/3 md:w-full">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={customer.email}
              placeholder="Enter customer email"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-center text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="email-error"
            />
            <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-row items-center justify-center gap-4 md:justify-end">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Customer</Button>
      </div>
    </form>
  );
}
