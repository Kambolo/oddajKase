import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AddGroupModal from "../components/groups/AddGroupModal";
import EditGroupMembersModal from "../components/groups/EditGroupMembersModal";
import GroupCard from "../components/groups/GroupCard";
import GroupSummaryModal from "../components/groups/GroupSummaryModal";
import SideBar from "../components/layout/common/SideBar";
import TopBar from "../components/layout/common/TopBar";
import { initGoogleAnalytics, trackPageView } from "../lib/googleAnalytics";
import { useAppSelector, useAppDispatch } from "../store/store";
import { addGroup, updateGroupMembers, deleteGroup } from "../store/dataSlice";
import type { Group } from "../lib/types";
import { formatMoney } from "../util/utils";

const getGroupBalance = (group: Group) => {
  const total = Object.values(group.memberBalances!).reduce(
    (sum, value) => sum + value,
    0,
  );
  return formatMoney(total);
};

export default function GroupPage() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [summaryGroupId, setSummaryGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const contacts = useAppSelector((state) => state.data.contacts);
  const groups = useAppSelector((state) => state.data.groups);

  useEffect(() => {
    initGoogleAnalytics();
    trackPageView(location.pathname);
  }, [location.pathname]);

  const editingGroup =
    groups.find((group) => group.id === editingGroupId) ?? null;
  const summaryGroup =
    groups.find((group) => group.id === summaryGroupId) ?? null;

  const handleCreateGroup = (name: string, memberIds: string[]) => {
    dispatch(addGroup({ name, memberIds }));
    setIsAddOpen(false);
  };

  const handleSaveMembers = (memberIds: string[]) => {
    if (!editingGroup) return;
    dispatch(updateGroupMembers({ groupId: editingGroup.id, memberIds }));
  };

  const openEditMembers = (groupId: string) => setEditingGroupId(groupId);
  const openSummary = (groupId: string) => setSummaryGroupId(groupId);

  const handleDeleteGroup = (groupId: string) => {
    dispatch(deleteGroup(groupId));
    if (summaryGroupId === groupId) setSummaryGroupId(null);
    if (editingGroupId === groupId) setEditingGroupId(null);
  };

  const memberNames = useMemo(
    () => (group: Group) =>
      group.memberIds
        .map((id) => contacts.find((contact) => contact.id === id)?.name ?? "")
        .filter(Boolean),
    [contacts],
  );

  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [groups, searchQuery]);

  return (
    <div className="flex h-dvh min-h-screen bg-brand">
      <SideBar onAction={() => setIsAddOpen(true)} actionLabel="Add group" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          searchPlaceholder="Search groups..."
          onSearch={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-text">Groups</h1>
                  <p className="mt-2 max-w-2xl text-sm text-text/70">
                    Manage your groups and pick who participates in each shared
                    expense.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  + Add group
                </button>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  name={group.name}
                  amount={getGroupBalance(group)}
                  members={memberNames(group)}
                  onViewSummary={() => openSummary(group.id)}
                  onEdit={() => openEditMembers(group.id)}
                  onDelete={() => handleDeleteGroup(group.id)}
                />
              ))}
            </section>
          </div>
        </div>
      </div>

      <AddGroupModal
        open={isAddOpen}
        contacts={contacts}
        onClose={() => setIsAddOpen(false)}
        onCreate={handleCreateGroup}
      />

      {editingGroup && (
        <EditGroupMembersModal
          open={Boolean(editingGroup)}
          groupName={editingGroup.name}
          contacts={contacts}
          memberIds={editingGroup.memberIds}
          onClose={() => setEditingGroupId(null)}
          onSave={handleSaveMembers}
        />
      )}

      {summaryGroup && (
        <GroupSummaryModal
          open={Boolean(summaryGroup)}
          groupName={summaryGroup.name}
          balance={getGroupBalance(summaryGroup)}
          contacts={contacts}
          memberBalances={summaryGroup.memberBalances!}
          onClose={() => setSummaryGroupId(null)}
        />
      )}
    </div>
  );
}
