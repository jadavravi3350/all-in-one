"use client";

import React from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="text-xl font-bold tracking-tight cursor-pointer hover:text-indigo-600 transition-colors duration-300">
          UtilityHub
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <Link href="/pages/images" className="hover:text-indigo-600 transition-colors duration-200">Images</Link>
          <Link href="/pages/codedinetor" className="hover:text-indigo-600 transition-colors duration-200">Code Runner</Link>
          <Link href="/pages/videos" className="hover:text-indigo-600 transition-colors duration-200">Video</Link>
          <Link href="/pages/traslate" className="hover:text-indigo-600 transition-colors duration-200">Translate</Link>
          <Link href="/pages/pdf" className="hover:text-indigo-600 transition-colors duration-200">Pdf</Link>
        </div>
      </div>

      {/* Real Authentication Header Controller */}
      <div className="flex items-center gap-4 text-sm font-medium">
        {status === "loading" ? (
          <div className="text-xs text-slate-400 animate-pulse">Checking access...</div>
        ) : session && session.user ? (
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 pl-1.5 pr-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover border border-slate-100" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-slate-700 text-sm font-semibold max-w-[120px] truncate hidden sm:block">
              {session.user.name}
            </span>
            <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block"></div>
            <button 
              onClick={() => signOut()} 
              className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50" 
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => signIn("google")} 
              className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300 text-xs font-bold"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Google Login
            </button>
            <button 
              onClick={() => signIn("google")} 
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
