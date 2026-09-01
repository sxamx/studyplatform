import React from 'react';
import { Video, Clock, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { VideoBlock as IVideoBlock } from '../../../types';

interface VideoBlockProps {
  block: IVideoBlock;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  const rawUrl = block.url?.trim() || '';
  const lowerUrl = rawUrl.toLowerCase();

  // Placeholder if URL is empty
  if (!rawUrl) {
    return (
      <div className="my-5 p-6 rounded-2xl border border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-center">
        <Video className="w-8 h-8 text-[#0066CC] dark:text-[#4D94FF] mx-auto mb-2 opacity-60" />
        <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white">{block.title || 'Video de la Lección'}</h4>
        <p className="text-xs text-gray-400 mt-1">Configura la URL de YouTube, Vimeo o MP4 en el editor para reproducir el video.</p>
      </div>
    );
  }

  // Security check: only allow safe http/https URLs
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
    return (
      <div className="my-5 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Enlace de video bloqueado por seguridad (Protocolo no admitido).</span>
      </div>
    );
  }

  const isYouTube = lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
  const isVimeo = lowerUrl.includes('vimeo.com');
  const isEmbeddable = isYouTube || isVimeo;

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
    <div className="my-6 rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-[#F5F5F5] dark:bg-[#1A1A1A] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0E0E0] dark:border-[#2D2D2D]">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-[#0066CC] dark:text-[#4D94FF]" />
          <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
            {block.title || 'Video de la Lección'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {block.duration && (
            <span className="flex items-center gap-1 text-xs text-[#666666] dark:text-[#B0B0B0] mr-2">
              <Clock className="w-3.5 h-3.5" />
              {block.duration}
            </span>
          )}

          {/* Download button for direct video files */}
          {!isEmbeddable && (
            <a
              href={rawUrl}
              download
              target="_blank"
              rel="noopener noreferrer nofollow"
              title="Descargar video"
              className="p-1.5 rounded-lg bg-gray-200 dark:bg-[#252525] text-gray-700 dark:text-gray-300 hover:text-[#0066CC] transition"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}

          {/* External link button */}
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            title="Abrir video en nueva pestaña"
            className="p-1.5 rounded-lg bg-gray-200 dark:bg-[#252525] text-gray-700 dark:text-gray-300 hover:text-[#0066CC] transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="relative aspect-video w-full bg-black">
        {isEmbeddable ? (
          <iframe
            src={getEmbedUrl(rawUrl)}
            title={block.title || 'Video'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={rawUrl}
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
