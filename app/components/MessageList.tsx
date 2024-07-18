'use client';
import React from 'react';
import { useMessage } from '@/app/context/MessageContext';

const MessageList: React.FC = () => {
  const { messages } = useMessage();

  return (
    <div className="absolute right-10 top-10">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${
            msg.type === 'error'
              ? 'bg-red-500'
              : msg.type === 'success'
              ? 'bg-green-500'
              : 'bg-blue-500'
          } rounded-md p-2 text-white`}
        >
          {msg.message}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
