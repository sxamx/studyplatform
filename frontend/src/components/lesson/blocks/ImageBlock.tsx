import React from 'react';
import { ImageBlock as IImageBlock } from '../../../types';
import { safeHttpUrl } from '../../../utils/safeUrl';

interface ImageBlockProps {
  block: IImageBlock;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  const safeUrl = safeHttpUrl(block.url);
  return (
    <figure className="my-6 flex flex-col items-center">
      <div className="rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#2D2D2D] bg-[#F5F5F5] dark:bg-[#1A1A1A] max-w-full shadow-sm">
        {safeUrl ? <img
          src={safeUrl}
          alt={block.alt || 'Imagen de la lección'}
          className="max-h-[480px] w-auto object-contain mx-auto transition-transform hover:scale-[1.01]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/pwa-icon.svg';
          }}
        /> : <div className="p-8 text-xs font-semibold text-rose-600 dark:text-rose-400">Imagen bloqueada: URL no segura</div>}
      </div>
      {block.caption && (
        <figcaption className="text-xs text-[#666666] dark:text-[#B0B0B0] text-center mt-2.5 italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};
