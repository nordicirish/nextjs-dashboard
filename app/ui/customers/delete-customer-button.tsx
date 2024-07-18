'use client';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteCustomer } from '@/app/lib/actions';
import { useMessage } from '@/app/context/MessageContext';

export function DeleteCustomer({ id , name }: { id: string, name: string }) {
  const { addMessage } = useMessage();

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await deleteCustomer(id, name);
    console.log(result);

    if ('message' in result) {
      addMessage(result.message, result.error ? 'error' : 'success');
    } else {
      addMessage('Unexpected response from delete operation.', 'error');
    }
  };

  return (
    <div>
      <form onSubmit={handleDelete}>
        <button
          type="submit"
          className="rounded-md border p-2 hover:bg-gray-100"
        >
          <span className="sr-only">Delete</span>
          <TrashIcon className="w-5" />
        </button>
      </form>
    </div>
  );
}
