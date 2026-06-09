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
    <div className="flex h-full w-56 flex-col bg-[#f2f5f3] font-sans">
      {/* Logo / Title */}
      <SideBarTitle />

      {/* Divider */}
      <div className="mx-4 mb-3.5 h-px rounded bg-[#dde7e2]" />

      {/* Nav Links */}
      <div className="flex flex-1 flex-col gap-1 px-2.5">
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
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={onAction}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-accent-dark py-3.25 text-sm font-semibold tracking-tight text-text-light transition-all hover:bg-accent-dark/90 cursor-pointer"
        >
          {/* <span className="text-lg leading-none -mt-0.5">+</span> */}
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
