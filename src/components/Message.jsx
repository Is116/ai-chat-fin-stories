import React from 'react';
import { User } from 'lucide-react';

const Message = ({ message, characterAvatar, characterColor, characterImage }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
      <div
        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border shadow-sm overflow-hidden ${
          isUser 
            ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-300' 
            : 'bg-gray-100 border-gray-200'
        }`}
      >
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <img 
            src={characterImage || '/book.svg'} 
            alt="Character"
            className="w-full h-full object-cover notranslate"
          />
        )}
      </div>
      
      <div
        className={`max-w-[75%] rounded-2xl border shadow-lg overflow-hidden ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white border-blue-300'
            : 'bg-white text-gray-900 border-gray-200'
        }`}
      >
        {message.image && (
          <div className="border-b border-gray-200">
            <img 
              src={message.image} 
              alt="Uploaded" 
              className="w-full max-w-md object-contain notranslate"
            />
          </div>
        )}
        {message.content && (
          <p className="whitespace-pre-wrap font-medium leading-relaxed p-5 notranslate" translate="no">{message.content}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
