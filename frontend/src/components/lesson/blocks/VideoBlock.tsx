import React from 'react';
import { Video, Clock } from 'lucide-react';
import { VideoBlock as IVideoBlock } from '../../../types';

interface VideoBlockProps {
  block: IVideoBlock;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  const isEmbeddable = block.url.includes('youtube.com') || block.url.includes('youtu.be') || block.url.includes('vimeo.com');

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div className="my-6 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-[#F5F5F5] dark:bg-[#1A1A1A] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0E0E0] dark:border-[#2D2D2D]">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-[#0066CC] dark:text-[#4D94FF]" />
          <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
            {block.title}
          </span>
        </div>
        {block.duration && (
          <span className="flex items-center gap-1 text-xs text-[#666666] dark:text-[#B0B0B0]">
            <Clock className="w-3.5 h-3.5" />
            {block.duration}
          </span>
        )}
      </div>

      <div className="relative aspect-video w-full bg-black">
        {isEmbeddable ? (
          <iframe
            src={getEmbedUrl(block.url)}
            title={block.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={block.url}
            poster={block.thumbnail}
            controls
            className="w-full h-full object-contain"
          >
            Tu navegador no soporta el elemento de video.
          </video>
        )}
      </div>
    </div>
  );
};
