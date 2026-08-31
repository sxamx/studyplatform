import React from 'react';
import { ImageBlock as IImageBlock } from '../../../types';

interface ImageBlockProps {
  block: IImageBlock;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  return (
    <figure className="my-6 flex flex-col items-center">
      <div className="rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#2D2D2D] bg-[#F5F5F5] dark:bg-[#1A1A1A] max-w-full shadow-sm">
        <img
          src={block.url}
          alt={block.alt || 'Imagen de la lección'}
          className="max-h-[480px] w-auto object-contain mx-auto transition-transform hover:scale-[1.01]"
          loading="lazy"
          onError={(e) => {
            // Fallback placeholder
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/600x300?text=${encodeURIComponent(block.alt || 'Imagen')}`;
          }}
        />
      </div>
      {block.caption && (
        <figcaption className="text-xs text-[#666666] dark:text-[#B0B0B0] text-center mt-2.5 italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};
