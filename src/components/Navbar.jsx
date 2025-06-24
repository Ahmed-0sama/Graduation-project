import React from "react";
import { Link, useLocation } from "react-router-dom";
import { RiDashboardLine } from "react-icons/ri";
import { IoStatsChartOutline } from "react-icons/io5";
import { BiHistory } from "react-icons/bi";
import { BsCart3 } from "react-icons/bs";
import clsx from "clsx";
import { useContext } from "react";
import UserInfoContext from "../Context/User/UserInfoContext";

const Navbar = ({ className }) => {
  const location = useLocation();
  const { user } = useContext(UserInfoContext);
  console.log("[Navbar] user:", user);

  return (
    <nav
      className={clsx(
        "fixed left-0 top-0 h-screen w-64 bg-[#1a1a1a] text-gray-300 p-4 !z-[9999]",
        className
      )}
    >
      <div className="space-y-8">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 px-4"></div>

        {/* Navigation Links */}
        <div className="space-y-2">
          <Link
            to="/"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#2a2a2a] hover:text-blue-500 transition-colors ${
              location.pathname === "/"
                ? "text-blue-500 bg-[#2a2a2a]"
                : "text-gray-300"
            }`}
          >
            <RiDashboardLine className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/reports"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#2a2a2a] hover:text-blue-500 transition-colors ${
              location.pathname === "/reports"
                ? "text-blue-500 bg-[#2a2a2a]"
                : "text-gray-300"
            }`}
          >
            <IoStatsChartOutline className="w-5 h-5" />
            <span>Reports</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#2a2a2a] hover:text-blue-500 transition-colors ${
              location.pathname === "/history"
                ? "text-blue-500 bg-[#2a2a2a]"
                : "text-gray-300"
            }`}
          >
            <BiHistory className="w-5 h-5" />
            <span>History</span>
          </Link>

          {/* Removed To Buy Link */}

          <Link
            to="/to-buy"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#2a2a2a] hover:text-blue-500 transition-colors ${
              location.pathname === "/to-buy"
                ? "text-blue-500 bg-[#2a2a2a]"
                : "text-gray-300"
            }`}
          >
            <BsCart3 className="w-5 h-5" />
            <span>To Buy</span>
          </Link>

          {user && (user.isAdmin || user.email === "admin@admin.com") && (
            <Link
              to="/admin"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#2a2a2a] hover:text-yellow-400 transition-colors ${
                location.pathname === "/admin"
                  ? "text-yellow-400 bg-[#2a2a2a]"
                  : "text-gray-300"
              }`}
            >
              <span className="font-bold">Admin Panel</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
