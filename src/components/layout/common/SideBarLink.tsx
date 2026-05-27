import { useLocation, Link } from "react-router";

export default function SideBarLink({
  to,
  name,
  icon,
}: {
  to: string;
  name: string;
  icon: React.ReactNode;
}) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 50,
        background: active ? "#e4ede8" : "transparent",
        color: active ? "#2d4a3e" : "#7a9e8e",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        textDecoration: "none",
        transition: "background 0.18s, color 0.18s",
        letterSpacing: "-0.1px",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "#edf3ef";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background =
            "transparent";
        }
      }}
    >
      {icon}
      {name}
    </Link>
  );
}
