import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CharacterCard = ({ character, onSelect }) => {
  const { t } = useTranslation();
  
  return (
    <div
      onClick={() => onSelect(character)}
      className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1"
    >
      <div className="bg-gray-100 p-0 flex items-center justify-center h-56 relative overflow-hidden">
        <img 
          src={character.image || '/book.svg'} 
          alt={character.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 notranslate"
        />
      </div>
      
      <div className="p-6 bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight notranslate" translate="no">
          {character.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {t('character.from')} <span className="font-semibold text-gray-700 notranslate" translate="no">{character.book_title || character.book}</span>
        </p>
        
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-purple-700 transition-all shadow-md">
          {t('character.startChat')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CharacterCard;
