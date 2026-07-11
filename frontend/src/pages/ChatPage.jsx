import React from 'react';
import { MessageCircle, Wrench } from 'lucide-react';

const ChatPage = ({ role }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <div className="relative mb-6">
        <MessageCircle className="w-24 h-24 text-blue-500 opacity-20" />
        <Wrench className="w-12 h-12 text-blue-600 absolute bottom-0 right-0 animate-bounce" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Chat Feature in Development
      </h2>
      <p className="text-gray-600 max-w-md mx-auto text-lg">
        We are working hard to bring you a seamless messaging experience. 
        This feature will be available soon!
      </p>
    </div>
  );
};

export default ChatPage;
