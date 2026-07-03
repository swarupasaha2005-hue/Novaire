import React from 'react';
import Link from 'next/link';

interface DocsPaginationProps {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export default function DocsPagination({ prev, next }: DocsPaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-20 pt-8 border-t border-white/10">
      {prev ? (
        <Link 
          href={prev.href} 
          className="group w-full sm:w-1/2 flex flex-col items-start p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Previous
          </span>
          <span className="text-lg font-medium text-white group-hover:text-[#3ECF8E] transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block sm:w-1/2" />
      )}
      
      {next ? (
        <Link 
          href={next.href} 
          className="group w-full sm:w-1/2 flex flex-col items-end p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300 text-right"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2 justify-end">
            Next <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
          <span className="text-lg font-medium text-white group-hover:text-[#3ECF8E] transition-colors">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block sm:w-1/2" />
      )}
    </div>
  );
}
