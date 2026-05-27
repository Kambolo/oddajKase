import { useLocation } from "react-router";
import DashboardIcon from "../../icons/DashboardIcon";
import GroupsIcon from "../../icons/GropusIcon";
import SideBarLink from "./SideBarLink";
import SideBarTitle from "./SidebarTitle";

type Props = {
  onAction: () => void;
  actionLabel?: string;
};

export default function SideBar({
  onAction,
  actionLabel = "New Expense",
}: Props) {
  const location = useLocation();
  const dashActive = location.pathname === "/dashboard";
  const groupsActive = location.pathname === "/groups";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: 224,
        background: "#f2f5f3",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      {/* Logo / Title */}
      <SideBarTitle />

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "#dde7e2",
          margin: "0 16px 14px",
          borderRadius: 1,
        }}
      />

      {/* Nav Links */}
      <div
        style={{
          flex: 1,
          padding: "0 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <SideBarLink
          to="/dashboard"
          name="Dashboard"
          icon={<DashboardIcon active={dashActive} />}
        />
        <SideBarLink
          to="/groups"
          name="Groups"
          icon={<GroupsIcon active={groupsActive} />}
        />
      </div>

      {/* New Expense CTA */}
      <div style={{ padding: "16px 16px 24px" }}>
        <button
          onClick={onAction}
          style={{
            width: "100%",
            padding: "13px 0",
            borderRadius: 50,
            background: "#6b9e8a",
            color: "#f0f5f2",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            letterSpacing: "-0.1px",
            boxShadow: "0 2px 12px rgba(107, 158, 138, 0.28)",
            transition: "background 0.18s, box-shadow 0.18s, transform 0.12s",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "#5f8c7a";
            btn.style.boxShadow = "0 4px 18px rgba(107, 158, 138, 0.38)";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "#6b9e8a";
            btn.style.boxShadow = "0 2px 12px rgba(107, 158, 138, 0.28)";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(0.97)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
