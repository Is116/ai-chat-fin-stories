import React from 'react';
import { User } from 'lucide-react';

const Message = ({ message, characterAvatar, characterColor, characterImage }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
      <div
        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${
          isUser 
            ? 'bg-black' 
            : `bg-gradient-to-br ${characterColor}`
        }`}
      >
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <img 
            src={characterImage || '/book.svg'} 
            alt="Character"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div
        className={`max-w-[75%] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
          isUser
            ? 'bg-black text-white'
            : 'bg-white text-black'
        }`}
      >
        {message.image && (
          <div className="border-b-2 border-black">
            <img 
              src={message.image} 
              alt="Uploaded" 
              className="w-full max-w-md object-contain"
            />
          </div>
        )}
        {message.content && (
          <p className="whitespace-pre-wrap font-medium leading-relaxed p-5">{message.content}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
