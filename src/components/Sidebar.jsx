// Sidebar.jsx (Frontend - React)

import React, { useState } from "react";
// Font Awesome imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUserFriends, // <-- Used for User Management
  faSignOutAlt,
  faHome,
  faSearch,
  faEllipsisV,
  faBoxes, // Used for Order Management (Inventory/Orders concept)
  faUser, // Used for Create New Users
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/LOGO.jpg";
// --- HELPER DATA & FUNCTIONS (Kept for ProfileBar structural integrity) ---

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

// Icon Mapping Logic - Simplified for the three required items
const getItemIcon = (id) => {
  if (id.includes("dashboard")) return faHome;
  if (id.includes("orders")) return faBoxes;
  if (id.includes("create-users")) return faUser;
  if (id.includes("manage-users")) return faUserFriends; // <-- ADDED LOGIC
  return faChartBar; // Fallback
};

// ⭐️ Navigation Sections - ADDED 'manage-users'
const navSections = [
  {
    title: "Main Navigation",
    icon: faChartBar,
    items: [
      { id: "dashboard", text: "Dashboard" },
      { id: "orders", text: "Order Management" },
      { id: "manage-users", text: "Show Users" }, // <-- NEW ITEM ADDED HERE
      { id: "create-users", text: "Create New Users" },
    ],
  },
];

// ------------------------------------
// MAIN SIDEBAR COMPONENT
// ------------------------------------

function Sidebar({ onLogout, user, activeItem, setActiveItem }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // --- Profile Bar Component (Kept for styling) ---
  const ProfileBar = () => {
    const fullName = user?.fullName;
    const roleId = user?.roleId;
    const roleName = USER_ROLES[Number(roleId)] || "Administrator";
    const initials = getInitials(fullName);

    if (!user || (!fullName && !roleId)) {
      return (
        <div className='flex items-center justify-between p-2 rounded-xl bg-gray-800/50'>
          <div className='flex items-center min-w-0'>
            <div className='w-10 h-10 rounded-full bg-gray-600 mr-3'></div>
            <div>
              <div className='text-white text-sm font-semibold'>Guest User</div>
              <div className='text-xs text-gray-400'>No Role Info</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='flex items-center justify-between p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition'>
        <div className='flex items-center min-w-0'>
          <div className='w-10 h-10 rounded-full flex-shrink-0 shadow-md mr-3 border border-white/10 bg-gray-600 flex items-center justify-center text-sm font-bold'>
            <span className='text-white'>{initials}</span>
          </div>
          <div className='flex-grow min-w-0'>
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
          onClick={toggleMenu}
          className={`text-gray-400 hover:text-white transition flex-shrink-0 ml-2 p-1 rounded-full ${
            isMenuOpen ? "bg-gray-700" : ""
          }`}
        >
          <FontAwesomeIcon icon={faEllipsisV} className='w-4 h-4' />
        </button>
      </div>
    );
  };
  // --- End Profile Bar Component ---

  return (
    <aside className='fixed top-0 left-0 h-screen w-64 bg-black text-white p-4 border-r border-gray-900 shadow-2xl z-20 flex flex-col'>
      {/* ⭐️ LOGOUT DROPDOWN MENU */}
      {isMenuOpen && (
        <div className='fixed left-64 bottom-4 w-40 p-1 rounded-lg bg-gray-700 shadow-2xl z-50'>
          <button
            onClick={() => {
              onLogout();
              setIsMenuOpen(false);
            }}
            className='flex items-center w-full py-2 px-2 text-sm font-medium text-red-400 rounded-md hover:bg-red-900/40 transition duration-150'
          >
            <FontAwesomeIcon icon={faSignOutAlt} className='mr-3 w-4 h-4' />
            Logout
          </button>
        </div>
      )}

      {/* Search Bar Container (Kept for styling) */}
      <div className='flex-shrink-0 pb-4 mb-4 border-b border-gray-700/50'>
        <div className='flex justify-center items-center'>
          <img src={logo} className='w-16 mb-2' alt='Logo' />
        </div>
        <h1 className='text-center font-extrabold'>ADMIN CONSOLE</h1>
        {/* <div className='relative'>
          <input
            type='text'
            placeholder='Search...'
            className='w-full py-2.5 pl-10 pr-4 text-sm bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border-none placeholder-gray-400'
          />
          <FontAwesomeIcon
            icon={faSearch}
            className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400'
          />
        </div> */}
      </div>

      {/* Navigation Sections (Scrollable) */}
      <nav className='flex-grow overflow-y-auto pr-2'>
        {navSections.map((section, index) => (
          <div key={section.title} className='mb-4'>
            {/* Section Title Style */}
            <div className='flex items-center text-xs text-gray-400 uppercase tracking-wide font-bold mb-3 pl-2'>
              <FontAwesomeIcon
                icon={section.icon}
                className='mr-2 w-3.5 h-3.5 text-blue-400'
              />
              {section.title}
            </div>
            <ul>
              {section.items.map((item) => (
                <li key={item.id} className='mb-1 relative'>
                  <a
                    // Sets the hash for the URL, #orders, #create-users, or just # for dashboard
                    href={item.id === "dashboard" ? "#" : `#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      // Calls the handler in DashboardPage to update the URL and state
                      setActiveItem(item.id);
                    }}
                    className={`flex items-center py-2.5 pl-4 pr-3 rounded-xl text-sm transition-all duration-200 ease-in-out
                                  ${
                                    activeItem === item.id
                                      ? "bg-blue-600 text-white font-semibold shadow-lg shadow-black/30"
                                      : "hover:bg-gray-800 text-gray-200"
                                  }`}
                  >
                    <FontAwesomeIcon
                      icon={getItemIcon(item.id)}
                      className={`mr-3 w-5 h-5 ${
                        activeItem === item.id ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <span className='flex-grow'>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
            {/* Divider */}
            {index < navSections.length - 1 && (
              <hr className='my-5 border-gray-800' />
            )}
          </div>
        ))}
      </nav>

      {/* Profile Section (PINNED TO BOTTOM) */}
      <div className='mt-auto pt-2 border-t border-gray-700/50 flex-shrink-0 relative'>
        <ProfileBar />
      </div>
    </aside>
  );
}

export default Sidebar;
