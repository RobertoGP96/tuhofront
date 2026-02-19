import { Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';

export const UhoContactInfo: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 border-l-4 border-primary-navy pl-4">
      <h2 className="w-full uppercase text-xl text-primary-navy font-bold text-start">
        Puede encontrarnos en:
      </h2>
      <ul className="w-full flex flex-col justify-start items-start gap-2 text-sm">
        <li className="w-full flex flex-row justify-start items-center text-secondary-lime gap-3">
          <MapPin size={16} className="text-secondary-lime shrink-0" />
          <span>Ave. XX Aniversario. Piedra Blanca. Holguín. Cuba</span>
        </li>
        <li className="w-full flex flex-row justify-start items-center text-secondary-lime gap-3">
          <Phone size={16} className="text-secondary-lime shrink-0" />
          <span>+53 24425555</span>
        </li>
        <li className="w-full flex flex-row justify-start items-center text-secondary-lime gap-3">
          <Mail size={16} className="text-secondary-lime shrink-0" />
          <span>uho@uho.edu.cu</span>
        </li>
      </ul>
    </div>
  );
};
