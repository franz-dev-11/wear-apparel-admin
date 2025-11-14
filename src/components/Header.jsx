import React from "react";
// Assuming you have a standard hamburger icon like Menu from lucide-react
// Replace this with your actual icon library import if needed
import { Menu } from "lucide-react";

const Header = () => {
  return (
    // Container:
    // - Fixed position at the top
    // - Full width
    // - White background and subtle shadow
    // - Key change: Hidden on medium screens and up (md:hidden), ensuring it's mobile-only.
    <header className='sticky top-0 z-50 bg-white shadow-md p-4 md:hidden'>
      <div className='flex items-center justify-between'>
        {/* Left Section: Logo/App Title */}
        <div className='flex items-center'>
          {/* Replace 'A' with a small logo image or simple icon if available */}
          <span className='text-xl font-bold text-gray-800'>WEAR APPAREL</span>
        </div>

        {/* Right Section: Mobile Menu Icon (Hamburger) */}
        <button
          className='p-1 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
          aria-label='Toggle Menu'
          // In a real application, you would add an onClick handler here
          // to open or close a mobile sidebar/menu.
          onClick={() => console.log("Menu button clicked")}
        >
          {/* Using the Menu icon from lucide-react */}
          <Menu className='w-6 h-6' />
        </button>
      </div>
    </header>
  );
};

export default Header;
