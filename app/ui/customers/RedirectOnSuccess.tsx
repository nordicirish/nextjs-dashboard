import { useEffect } from 'react';
import { redirect } from 'next/navigation';

const RedirectOnSuccess = ({
  success,
  resultMessage,
  addMessage,
}: {
  success: boolean;
  resultMessage: string;
  addMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}) => {
  useEffect(() => {
    if (success && resultMessage) {
      addMessage(resultMessage, 'success');
      redirect('/dashboard/customers');
    }
  }, [success, resultMessage, addMessage]);

  return null; // return null as this component doesn't render anything
};

export default RedirectOnSuccess;
