import { signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import { auth } from "../../../lib/firebase";
import BellIcon from "../../icons/BellIcon";
import GearIcon from "../../icons/GearIcon";
import LoginIcon from "../../icons/LoginIcon";
import LogoutIcon from "../../icons/LogoutIcon";
import SearchIcon from "../../icons/SearchIcon";

type Props = {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
};

export default function TopBar({
  searchPlaceholder = "Search transactions...",
  onSearch,
}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    navigate("/signin");
  };

  const handleLogin = () => {
    setMenuOpen(false);
    navigate("/signin");
  };

  const avatarLetter =
    user?.displayName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .topbar-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          transition: background 0.15s;
        }
        .topbar-icon-btn:hover { background: #e4ede8; }

        .profile-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 180px;
          background: #fff;
          border: 1px solid #dde7e2;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(45,74,62,0.10);
          overflow: hidden;
          z-index: 100;
          animation: menuIn 0.14s ease;
        }
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .profile-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          text-align: left;
          transition: background 0.13s;
        }
        .profile-menu-item:hover { background: #f2f5f3; }
        .profile-menu-item.danger { color: #c0756a; }
        .profile-menu-item.primary { color: #2d4a3e; }
      `}</style>

      <div
        style={{
          height: 64,
          background: "#f2f5f3",
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          paddingRight: 20,
          gap: 12,
          borderBottom: "1px solid #dde7e2",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            maxWidth: 360,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: searchFocused ? "#fff" : "#eaefec",
            borderRadius: 50,
            padding: "0 16px",
            height: 38,
            border: `1.5px solid ${searchFocused ? "#9ab5a8" : "transparent"}`,
            transition: "background 0.18s, border-color 0.18s",
          }}
        >
          <SearchIcon />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              onSearch?.(value);
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13.5,
              color: "#2d4a3e",
              fontWeight: 400,
            }}
          />
        </div>

        <div style={{ flex: 1 }} />

        {/* Bell */}
        <button className="topbar-icon-btn" title="Notifications">
          <BellIcon />
        </button>

        {/* Gear */}
        <button className="topbar-icon-btn" title="Settings">
          <GearIcon />
        </button>

        {/* Avatar + dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <div
            onClick={() => setMenuOpen((v) => !v)}
            title="Profile"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#6b9e8a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              border: menuOpen ? "2px solid #8aab9a" : "2px solid #c5d9ce",
              transition: "border-color 0.15s",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#8aab9a";
            }}
            onMouseLeave={(e) => {
              if (!menuOpen)
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "#c5d9ce";
            }}
          >
            {avatarLetter ? (
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#e8f0ec",
                  lineHeight: 1,
                }}
              >
                {avatarLetter}
              </span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#e8f0ec" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#e8f0ec" />
              </svg>
            )}
          </div>

          {menuOpen && (
            <div className="profile-menu">
              {/* User info header if logged in */}
              {user && (
                <div
                  style={{
                    padding: "12px 16px 10px",
                    borderBottom: "1px solid #edf3ef",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#2d4a3e",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.displayName ?? "My account"}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11.5,
                      color: "#8aab9a",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.email}
                  </div>
                </div>
              )}

              {user ? (
                <button
                  className="profile-menu-item danger"
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                  Log out
                </button>
              ) : (
                <button
                  className="profile-menu-item primary"
                  onClick={handleLogin}
                >
                  <LoginIcon />
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
