import Form from '@/app/ui/customers/edit-form';
import Breadcrumbs from '@/app/ui/customers/breadcrumbs';

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchCustomerById } from '@/app/lib/data';
export const metadata: Metadata = {
  title: 'Dashboard Edit Customer',
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [customer] = await Promise.all([fetchCustomerById(id)]);

  // invoke notFound() if customer does not exist
  if (!customer) notFound();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Edit Customer',
            href: `/dashboard/customers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
    </main>
  );
}
