import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
  const isImage = message.message_type === 'image';
  const isFile = message.message_type === 'file';

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
        isOwn 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      }`}>
        {isImage ? (
          <img 
            src={message.content} 
            alt="Uploaded content" 
            className="max-w-full rounded-lg mb-1 object-cover max-h-60"
          />
        ) : isFile ? (
          <a 
            href={message.content} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 underline text-sm"
          >
            📎 Download File
          </a>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        <span className={`text-[10px] block mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'} text-right`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
