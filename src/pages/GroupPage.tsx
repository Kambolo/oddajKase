import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AddGroupModal from "../components/groups/AddGroupModal";
import EditGroupMembersModal from "../components/groups/EditGroupMembersModal";
import GroupCard from "../components/groups/GroupCard";
import GroupSummaryModal from "../components/groups/GroupSummaryModal";
import JoinGroupModal from "../components/groups/JoinGroupModal";
import SideBar from "../components/layout/common/SideBar";
import TopBar from "../components/layout/common/TopBar";
import { initGoogleAnalytics, trackPageView } from "../lib/googleAnalytics";
import type { Group } from "../lib/types";
import {
  addGroup,
  deleteGroup,
  joinGroup,
  updateGroupMembers,
} from "../store/dataSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { formatMoney } from "../util/utils";

const getGroupBalance = (group: Group) => {
  const total = Object.values(group.memberBalances ?? {}).reduce(
    (sum, value) => sum + value,
    0,
  );
  return formatMoney(total);
};

export default function GroupPage() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [summaryGroupId, setSummaryGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const contacts = useAppSelector((state) => state.data.contacts);
  const groups = useAppSelector((state) => state.data.groups);

  useEffect(() => {
    initGoogleAnalytics();
    trackPageView(location.pathname);
  }, [location.pathname]);

  const editingGroup = groups.find((g) => g.id === editingGroupId) ?? null;
  const summaryGroup = groups.find((g) => g.id === summaryGroupId) ?? null;

  const handleCreateGroup = (name: string, inviteCode: string) => {
    dispatch(addGroup({ name, inviteCode }));
  };

  const handleJoinGroup = (
    inviteCode: string,
  ): "ok" | "not_found" | "already_joined" => {
    const group = groups.find(
      (g) => g.inviteCode?.toUpperCase() === inviteCode.toUpperCase(),
    );
    if (!group) return "not_found";
    if (group.memberIds.includes("me")) return "already_joined";
    dispatch(joinGroup({ inviteCode }));
    return "ok";
  };

  const handleSaveMembers = (memberIds: string[]) => {
    if (!editingGroup) return;
    dispatch(updateGroupMembers({ groupId: editingGroup.id, memberIds }));
  };

  const handleDeleteGroup = (groupId: string) => {
    dispatch(deleteGroup(groupId));
    if (summaryGroupId === groupId) setSummaryGroupId(null);
    if (editingGroupId === groupId) setEditingGroupId(null);
  };

  const memberNames = useMemo(
    () => (group: Group) =>
      group.memberIds
        .map((id) =>
          id === "me" ? "You" : (contacts.find((c) => c.id === id)?.name ?? ""),
        )
        .filter(Boolean),
    [contacts],
  );

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [groups, searchQuery],
  );

  return (
    <div className="flex h-dvh min-h-screen bg-brand">
      <SideBar onAction={() => setIsAddOpen(true)} actionLabel="Add group" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          searchPlaceholder="Search groups..."
          onSearch={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-text">Groups</h1>
                  <p className="mt-2 max-w-2xl text-sm text-text/70">
                    Manage your groups and pick who participates in each shared
                    expense.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsJoinOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border hover:bg-slate-100 border-slate-300 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 cursor-pointer hover:bg-light-gray"
                  >
                    Join with code
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="text-text-light transition-all hover:bg-accent-dark/90 items-center justify-center rounded-full bg-accent-dark px-5 py-3 text-sm font-semibold  hover:bg-primary/90 cursor-pointer"
                  >
                    Add group
                  </button>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  name={group.name}
                  amount={getGroupBalance(group)}
                  members={memberNames(group)}
                  inviteCode={group.inviteCode}
                  onViewSummary={() => setSummaryGroupId(group.id)}
                  onEdit={() => setEditingGroupId(group.id)}
                  onDelete={() => handleDeleteGroup(group.id)}
                />
              ))}
            </section>
          </div>
        </div>
      </div>

      <AddGroupModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreate={handleCreateGroup}
      />

      <JoinGroupModal
        open={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={handleJoinGroup}
      />

      {editingGroup && (
        <EditGroupMembersModal
          open
          groupName={editingGroup.name}
          contacts={contacts}
          memberIds={editingGroup.memberIds}
          onClose={() => setEditingGroupId(null)}
          onSave={handleSaveMembers}
        />
      )}

      {summaryGroup && (
        <GroupSummaryModal
          open
          groupName={summaryGroup.name}
          balance={getGroupBalance(summaryGroup)}
          contacts={contacts}
          memberBalances={summaryGroup.memberBalances ?? {}}
          expenses={summaryGroup.expenses ?? []}
          payments={summaryGroup.payments ?? []}
          onClose={() => setSummaryGroupId(null)}
        />
      )}
    </div>
  );
}
