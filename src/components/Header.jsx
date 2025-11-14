// Header.jsx (Frontend - React - Mobile Responsive)

import React, { useState } from "react";
// Font Awesome imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUserFriends,
  faSignOutAlt,
  faHome,
  faBars, // Hamburger icon for mobile menu
  faTimes, // Close icon for mobile menu
  faEllipsisV, // Ellipsis for desktop profile menu
  faBoxes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/LOGO.jpg";

// --- HELPER DATA & FUNCTIONS (Unchanged) ---

// Static Role Mapping
const USER_ROLES = {
  1: "System Administrator",
  // ... other roles ...
};

// Helper to get initials
const getInitials = (fullName) => {
  if (!fullName) return "U";
  const parts = fullName.split(" ").filter((n) => n);
  if (parts.length > 1) {
    return parts
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return fullName.slice(0, 2).toUpperCase();
};

// Icon Mapping Logic
const getItemIcon = (id) => {
  if (id.includes("dashboard")) return faHome;
  if (id.includes("orders")) return faBoxes;
  if (id.includes("create-users")) return faUser;
  if (id.includes("manage-users")) return faUserFriends;
  return faChartBar; // Fallback
};

// Navigation Items (Simplified and flattened for header)
const navItems = [
  { id: "dashboard", text: "Dashboard" },
  { id: "orders", text: "Order Management" },
  { id: "manage-users", text: "Show Users" },
  { id: "create-users", text: "Create New Users" },
];

// ------------------------------------
// MAIN HEADER COMPONENT
// ------------------------------------

function Header({ onLogout, user, activeItem, setActiveItem }) {
  // State for the Mobile Navigation menu (Hamburger menu)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  // ⭐️ NEW STATE for Desktop Profile Logout Dropdown
  const [isDesktopProfileMenuOpen, setIsDesktopProfileMenuOpen] =
    useState(false);

  const toggleMobileNav = () => setIsMobileNavOpen(!isMobileNavOpen);
  const toggleDesktopProfileMenu = () =>
    setIsDesktopProfileMenuOpen(!isDesktopProfileMenuOpen);

  // Function to handle link clicks and close the mobile menu
  const handleNavItemClick = (itemId) => {
    setActiveItem(itemId);
    setIsMobileNavOpen(false);
  };

  // Pre-calculate user data for both profile bar versions
  const fullName = user?.fullName;
  const roleId = user?.roleId;
  const roleName = USER_ROLES[Number(roleId)] || "Administrator";
  const initials = getInitials(fullName);

  // --- ⭐️ Profile Bar Component for PC View (Compact with Dropdown) ⭐️ ---
  const DesktopProfileBar = () => {
    if (!user || (!fullName && !roleId)) {
      return (
        <div className='hidden md:flex items-center p-1 rounded-xl bg-gray-800/50'>
          <div className='w-8 h-8 rounded-full bg-gray-600 mr-2'></div>
          <div className='text-white text-sm font-semibold hidden lg:block'>
            Guest
          </div>
        </div>
      );
    }

    return (
      <div className='hidden md:flex items-center p-1 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition relative ml-4'>
        <div className='flex items-center min-w-0'>
          <div className='w-8 h-8 rounded-full flex-shrink-0 shadow-md mr-2 border border-white/10 bg-gray-600 flex items-center justify-center text-sm font-bold'>
            <span className='text-white'>{initials}</span>
          </div>
          <div className='hidden lg:block flex-grow min-w-0 mr-3'>
            <div className='text-white text-sm font-semibold truncate'>
              <span className='truncate'>{fullName || "User"}</span>
            </div>
            <div
              className='text-xs text-gray-400 truncate'
              title={`Role: ${roleName}`}
            >
              {roleName}
            </div>
          </div>
        </div>
        <button
          onClick={toggleDesktopProfileMenu}
          className={`text-gray-400 hover:text-white transition flex-shrink-0 p-1 rounded-full ${
            isDesktopProfileMenuOpen ? "bg-gray-700" : ""
          }`}
        >
          <FontAwesomeIcon icon={faEllipsisV} className='w-4 h-4' />
        </button>

        {/* LOGOUT DROPDOWN MENU */}
        {isDesktopProfileMenuOpen && (
          <div className='absolute right-0 top-full mt-2 w-40 p-1 rounded-lg bg-gray-700 shadow-2xl z-50'>
            <button
              onClick={() => {
                onLogout();
                setIsDesktopProfileMenuOpen(false);
              }}
              className='flex items-center w-full py-2 px-2 text-sm font-medium text-red-400 rounded-md hover:bg-red-900/40 transition duration-150'
            >
              <FontAwesomeIcon icon={faSignOutAlt} className='mr-3 w-4 h-4' />
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };
  // --- End Desktop Profile Bar Component ---

  // --- ⭐️ Profile Bar Component for Mobile View (Full block in submenu) ⭐️ ---
  const MobileProfileBar = () => {
    if (!user || (!fullName && !roleId)) {
      return (
        <div className='flex items-center p-2 rounded-xl bg-gray-700 mb-4 md:hidden'>
          <div className='w-10 h-10 rounded-full bg-gray-600 mr-3'></div>
          <div className='text-white text-base font-semibold'>Guest User</div>
        </div>
      );
    }

    return (
      <div className='mb-4 p-3 rounded-xl bg-gray-700 shadow-inner md:hidden'>
        <div className='flex items-center min-w-0 mb-3'>
          <div className='w-10 h-10 rounded-full flex-shrink-0 shadow-md mr-3 border border-white/10 bg-blue-600 flex items-center justify-center text-sm font-bold'>
            <span className='text-white'>{initials}</span>
          </div>
          <div className='flex-grow min-w-0'>
            <div className='text-white text-base font-semibold truncate'>
              <span className='truncate'>{fullName || "User"}</span>
            </div>
            <div
              className='text-xs text-gray-400 truncate'
              title={`Role: ${roleName}`}
            >
              {roleName}
            </div>
          </div>
        </div>

        {/* Log Out Button */}
        <button
          onClick={() => {
            onLogout();
            setIsMobileNavOpen(false);
          }}
          className='flex items-center w-full py-2 px-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-900/40 transition duration-150 justify-center border border-red-900/40'
        >
          <FontAwesomeIcon icon={faSignOutAlt} className='mr-3 w-4 h-4' />
          Sign Out
        </button>
      </div>
    );
  };
  // --- End Mobile Profile Bar Component ---

  return (
    <header className='fixed top-0 left-0 right-0 h-16 bg-black text-white p-4 border-b border-gray-900 shadow-xl z-20 flex items-center justify-between'>
      {/* 1. Left Spacer (Mobile Only) */}
      <div className='flex-1 md:hidden'></div>

      {/* 2. Logo and Title Section (Centered on Desktop) */}
      <div className='flex items-center justify-center flex-1 md:flex-none'>
        <img src={logo} className='w-8 h-8 mr-3' alt='Logo' />
        <h1 className='text-xl font-bold hidden sm:block'>Admin Console</h1>
      </div>

      {/* 3. Desktop Navigation (Hidden on small screens) */}
      <nav className='hidden md:flex flex-grow justify-center space-x-2 lg:space-x-6 mx-4'>
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.id === "dashboard" ? "#" : `#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavItemClick(item.id);
            }}
            className={`flex items-center py-2 px-3 rounded-xl text-sm transition-all duration-200 ease-in-out
                        ${
                          activeItem === item.id
                            ? "bg-blue-600 text-white font-semibold shadow-md"
                            : "hover:bg-gray-800 text-gray-200"
                        }`}
          >
            <FontAwesomeIcon
              icon={getItemIcon(item.id)}
              className='mr-2 w-4 h-4'
            />
            {item.text}
          </a>
        ))}
      </nav>

      {/* 4. Right side: Desktop Profile Bar and Mobile Menu Toggle */}
      <div className='flex items-center justify-end flex-1 md:flex-none'>
        {/* ⭐️ Desktop Profile Bar (visible md:flex and up) ⭐️ */}
        <DesktopProfileBar />

        {/* Mobile Menu Button (md:hidden) */}
        <button
          onClick={toggleMobileNav}
          className='md:hidden text-gray-200 hover:text-white transition p-2 rounded-full hover:bg-gray-800'
        >
          <FontAwesomeIcon
            icon={isMobileNavOpen ? faTimes : faBars}
            className='w-5 h-5'
          />
        </button>
      </div>

      {/* 5. Mobile Navigation Dropdown (Visible only when open on mobile) */}
      {isMobileNavOpen && (
        <div className='absolute top-16 left-0 w-full bg-gray-900 shadow-xl p-4 md:hidden'>
          {/* ⭐️ Mobile Profile Bar ⭐️ */}
          <MobileProfileBar />

          <ul className='space-y-1'>
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.id === "dashboard" ? "#" : `#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavItemClick(item.id);
                  }}
                  className={`flex items-center py-2.5 pl-4 pr-3 rounded-xl text-sm transition-all duration-200 ease-in-out
                              ${
                                activeItem === item.id
                                  ? "bg-blue-600 text-white font-semibold shadow-lg"
                                  : "hover:bg-gray-800 text-gray-200"
                              }`}
                >
                  <FontAwesomeIcon
                    icon={getItemIcon(item.id)}
                    className='mr-3 w-5 h-5'
                  />
                  <span className='flex-grow'>{item.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

export default Header;
