import React from 'react'

function Footer() {
  return (
    <div>
         <footer className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 mt-12">
        <div className="mb-4 md:mb-0">
          <div className="text-xl font-bold mb-2 cursor-pointer hover:text-indigo-600 transition-colors duration-300">
             <img 
                src={"../icon.png"} 
                alt="Avatar"
                className=' h-18 rounded-[50%] object-cover'
              />
          </div>
          <div className="text-xs font-medium text-slate-400">© 2024 UTILITYHUB INC. ALL RIGHTS RESERVED.</div>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold text-slate-400 tracking-wider">
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">PRIVACY</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">TERMS</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">STATUS</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">CONTACT</a>
        </div>
      </footer>
    </div>
  )
}

export default Footer