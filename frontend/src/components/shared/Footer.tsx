import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, ExternalLink } from 'lucide-react';
import { GithubIcon, DiscordIcon } from './SocialIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#0F0F0F] text-[#1A1A1A] dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#0066CC] dark:bg-[#4D94FF] text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-[#1A1A1A] dark:text-white">
                StudyPlatform
              </span>
            </Link>
            <p className="text-xs text-[#666666] dark:text-[#808080] max-w-sm">
              Plataforma interactiva de aprendizaje, desarrollo web y modelado de bases de datos relacionales.
            </p>
          </div>

          {/* Social Links & Community */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* GitHub Link */}
            <a
              href="https://github.com/sxamx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1A1A1A] dark:hover:bg-[#252525] border border-[#E0E0E0] dark:border-[#2D2D2D] text-xs font-bold text-[#1A1A1A] dark:text-white transition-all shadow-sm group"
            >
              <GithubIcon className="w-4 h-4 text-[#1A1A1A] dark:text-white group-hover:scale-110 transition-transform" />
              <span>GitHub / sxamx</span>
              <ExternalLink className="w-3 h-3 text-gray-400 opacity-60" />
            </a>

            {/* Discord Link */}
            <a
              href="https://discord.gg/Q6msQeMWaE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 dark:bg-[#5865F2]/15 dark:hover:bg-[#5865F2]/25 border border-[#5865F2]/30 text-xs font-bold text-[#5865F2] transition-all shadow-sm group"
            >
              <DiscordIcon className="w-4 h-4 text-[#5865F2] group-hover:scale-110 transition-transform" />
              <span>Comunidad Discord</span>
              <ExternalLink className="w-3 h-3 text-[#5865F2] opacity-70" />
            </a>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 pt-6 border-t border-[#E0E0E0]/60 dark:border-[#2D2D2D]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#666666] dark:text-[#808080]">
          <p>© {new Date().getFullYear()} StudyPlatform. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            <span>Creado con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>por</span>
            <a
              href="https://github.com/sxamx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#0066CC] dark:text-[#4D94FF] hover:underline"
            >
              sxamx
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
