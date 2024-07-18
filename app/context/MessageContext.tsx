
'use client';
// context/MessageContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
} from 'react';

interface Message {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface MessageContextType {
  messages: Message[];
  addMessage: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ) => {
    setMessages((prev) => [...prev, { message, type }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.message !== message));
    }, 5000);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};