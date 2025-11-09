import React from 'react';
import { ArrowRight } from 'lucide-react';

const CharacterCard = ({ character, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(character)}
      className="group bg-white rounded-none border-2 border-black hover:border-4 transition-all cursor-pointer overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1"
    >
      <div className={`bg-gradient-to-br ${character.color} p-8 flex items-center justify-center h-64 relative overflow-hidden`}>
        <img 
          src={character.image || '/book.svg'} 
          alt={character.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6 bg-white">
        <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">
          {character.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          by <span className="font-bold text-gray-700">{character.book_title || character.book}</span>
        </p>
        
        <button className="w-full bg-black text-white font-bold py-3 px-4 uppercase text-sm tracking-wide flex items-center justify-center gap-2 group-hover:bg-gray-800 transition-colors">
          Start Chat
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CharacterCard;
