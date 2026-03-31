// Top navbar component
import { useState } from "react";
import { Bell, Moon, Sun, LogOut, User, Undo, Redo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useStore } from "../../store/useStore";
import { getInitials, getAvatarColor } from "../../utils/helpers";

/**
 * Top navigation bar with user menu and controls
 */
export function Navbar() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const {
    isDarkMode,
    toggleDarkMode,
    canUndo,
    canRedo,
    undo,
    redo,
    isCollapsed,
  } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  /**
   * Handle user sign out
   */
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  /**
   * Handle undo action
   */
  const handleUndo = async () => {
    if (canUndo) {
      await undo();
    }
  };

  /**
   * Handle redo action
   */
  const handleRedo = async () => {
    if (canRedo) {
      await redo();
    }
  };

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 transition-all duration-300 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      style={{ left: isCollapsed ? "4rem" : "16rem" }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left section - Page title and undo/redo */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Fleet Operations
          </h1>

          {/* Undo/Redo buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Right section - Actions and user menu */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div
                className={`w-8 h-8 rounded-full ${getAvatarColor(profile?.full_name || "User")} flex items-center justify-center text-white text-sm font-medium`}
              >
                {getInitials(profile?.full_name || "User")}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile?.role}
                </p>
              </div>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 z-50 w-56 py-1 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {profile?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/dashboard/settings");
                    }}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-700 transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-600 transition-colors dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
