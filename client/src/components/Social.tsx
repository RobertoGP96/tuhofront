import React from 'react';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

type SocialItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
};

const SocialChip: React.FC<{ item: SocialItem }> = ({ item }) => {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 aspect-square p-2 flex justify-center items-center transition-all duration-300 rounded-md border-2 border-primary-navy text-primary-navy hover:scale-110 hover:bg-secondary-lime hover:border-secondary-lime hover:text-white cursor-pointer group"
      aria-label={item.label}
    >
      <item.icon size={20} className="transition-transform duration-300 group-hover:scale-120" />
    </a>
  );
};

export const Social: React.FC = () => {
  const socialItems: SocialItem[] = [
    {
      icon: Facebook,
      label: "Facebook",
      href: "https://facebook.com/universidadholguin"
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://instagram.com/universidadholguin"
    },
    {
      icon: Youtube,
      label: "Youtube",
      href: "https://youtube.com/universidadholguin"
    },
    {
      icon: Twitter,
      label: "Twitter",
      href: "https://twitter.com/universidadholguin"
    }
  ];

  return (
    <div className="flex flex-col gap-3 items-start justify-start">
      <h2 className="w-full uppercase text-xl text-primary-navy font-bold text-start">
        Redes:
      </h2>
      <div className="flex flex-row gap-3 justify-start items-center">
        {socialItems.map((item, index) => (
          <SocialChip key={`social-${index}-${item.label}`} item={item} />
        ))}
      </div>
    </div>
  );
};
