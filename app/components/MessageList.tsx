'use client';
import React from 'react';
import { useMessage } from '@/app/context/MessageContext';

const MessageList: React.FC = () => {
  const { messages } = useMessage();

  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index} className={`alert alert-${msg.type}`}>
          {msg.message}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
