// src/components/TeamDashboard.jsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  
} from "firebase/firestore";

export default function TeamDashboard() {
  const [teamId, setTeamId] = useState(null);
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [addingTask, setAddingTask] = useState({});
  const [newTask, setNewTask] = useState({ title: "", assignedTo: "" });

  const currentUserId = auth.currentUser?.uid;

  // 🔹 Fetch user's teamId
  useEffect(() => {
    const fetchTeamId = async () => {
      if (!currentUserId) return;
      const userSnap = await getDoc(doc(db, "users", currentUserId));
      setTeamId(userSnap.exists() ? userSnap.data().teamId || null : null);
      setLoadingTeam(false);
    };
    fetchTeamId();
  }, [currentUserId]);

  // 🔹 Real-time listener for groups
  useEffect(() => {
    if (!teamId) return;
    const unsub = onSnapshot(collection(db, "teams", teamId, "groups"), (snap) => {
      setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [teamId]);

  // 🔹 Real-time listener for members
  useEffect(() => {
    if (!teamId) return;
    const unsub = onSnapshot(doc(db, "teams", teamId), async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const memberIds = data.members || [];
      const rolesMap = data.roles || {};
      const userDocs = await Promise.all(
        memberIds.map((id) => getDoc(doc(db, "users", id)))
      );
      setMembers(
        userDocs.map((udoc) => ({
          id: udoc.id,
          name: udoc.data().name,
          email: udoc.data().email,
          role: rolesMap[udoc.id] || "member",
        }))
      );
    });
    return () => unsub();
  }, [teamId]);

  // 🔹 Real-time tasks per group
  useEffect(() => {
    if (!teamId || !groups.length) return;
    const unsubs = groups.map((g) =>
      onSnapshot(collection(db, "teams", teamId, "groups", g.id, "tasks"), (snap) => {
        setTasks((prev) => ({ ...prev, [g.id]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [teamId, groups]);

  const isOwner = members.find((m) => m.id === currentUserId)?.role === "owner";

  // 🔹 Team creation
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return alert("Enter team name");
    setCreatingTeam(true);
    try {
      const teamRef = await addDoc(collection(db, "teams"), {
        name: newTeamName.trim(),
        owner: currentUserId,
        members: [currentUserId],
        roles: { [currentUserId]: "owner" },
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", currentUserId), { teamId: teamRef.id });
      setTeamId(teamRef.id);
      alert("Team created!");
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingTeam(false);
    }
  };

  // 🔹 Add new group
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return alert("Group name required");
    await addDoc(collection(db, "teams", teamId, "groups"), { name: newGroupName.trim(), createdAt: serverTimestamp() });
    setNewGroupName("");
    setAddingGroup(false);
  };

  // 🔹 Invite member
  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const q = query(collection(db, "users"), where("email", "==", inviteEmail.trim()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return alert("No user found with this email");
      const userDoc = snapshot.docs[0];
      const userRef = doc(db, "users", userDoc.id);
      await updateDoc(userRef, { teamId });
      const teamRef = doc(db, "teams", teamId);
      const teamSnap = await getDoc(teamRef);
      const roles = { ...teamSnap.data().roles, [userDoc.id]: "member" };
      await updateDoc(teamRef, { members: arrayUnion(userDoc.id), roles });
      alert("Member invited!");
      setInviteEmail("");
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔹 Promote/demote member
  const handleChangeRole = async (memberId, newRole) => {
    const teamRef = doc(db, "teams", teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) return;
    const roles = teamSnap.data().roles || {};
    if (newRole === "owner") {
      const currentOwner = Object.keys(roles).find((id) => roles[id] === "owner");
      if (currentOwner && currentOwner !== memberId) roles[currentOwner] = "member";
    }
    roles[memberId] = newRole;
    await updateDoc(teamRef, { roles });
  };

  // 🔹 Remove member
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    const teamRef = doc(db, "teams", teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) return;
    const data = teamSnap.data();
    await updateDoc(teamRef, {
      members: data.members.filter((id) => id !== memberId),
      roles: Object.fromEntries(Object.entries(data.roles).filter(([k]) => k !== memberId)),
    });
    await updateDoc(doc(db, "users", memberId), { teamId: null });
  };

  // 🔹 Delete group
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Delete this group?")) return;
    await deleteDoc(doc(db, "teams", teamId, "groups", groupId));
  };

  // 🔹 Add task
  const handleAddTask = async (groupId) => {
    if (!newTask.title.trim()) return alert("Task title required");
    await addDoc(collection(db, "teams", teamId, "groups", groupId, "tasks"), { ...newTask, status: "todo" });
    setNewTask({ title: "", assignedTo: "" });
    setAddingTask((prev) => ({ ...prev, [groupId]: false }));
  };

  // 🔹 Delete task
  const handleDeleteTask = async (groupId, taskId) => {
    await deleteDoc(doc(db, "teams", teamId, "groups", groupId, "tasks", taskId));
  };

  if (loadingTeam) return <p>Loading team...</p>;
  if (!teamId) {
    return (
      <div>
        <h2>You are not part of any team yet.</h2>
        <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team Name" />
        <button onClick={handleCreateTeam} disabled={creatingTeam}>{creatingTeam ? "Creating..." : "Create Team"}</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Team Dashboard</h1>

      {/* Members Section */}
      <h2 className="text-2xl font-semibold mb-2">Members</h2>
      {isOwner && !addingGroup && (
        <div className="mb-4 flex space-x-2">
          <input placeholder="Invite by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="border p-2 rounded" />
          <button onClick={handleInviteMember} className="px-3 py-1 bg-green-600 text-white rounded">Invite</button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {members.map((m) => (
          <div key={m.id} className="border p-3 rounded shadow">
            <h3 className="font-semibold">{m.name || m.email}</h3>
            <p className="italic text-sm">{m.role}</p>
            {isOwner && m.id !== currentUserId && (
              <div className="flex space-x-2 mt-2">
                {m.role !== "owner" && <button onClick={() => handleChangeRole(m.id, "owner")} className="px-2 py-1 bg-yellow-500 text-white rounded">Promote Owner</button>}
                {m.role === "member" && <button onClick={() => handleChangeRole(m.id, "admin")} className="px-2 py-1 bg-blue-500 text-white rounded">Promote Admin</button>}
                <button onClick={() => handleRemoveMember(m.id)} className="px-2 py-1 bg-red-600 text-white rounded">Remove</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Groups Section */}
      <h2 className="text-2xl font-semibold mb-2">Groups</h2>
      {isOwner && !addingGroup && (
        <button onClick={() => setAddingGroup(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Add New Group</button>
      )}
      {addingGroup && (
        <div className="mb-4 flex space-x-2">
          <input placeholder="Group Name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="border p-2 rounded flex-grow" />
          <button onClick={handleAddGroup} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
          <button onClick={() => { setAddingGroup(false); setNewGroupName(""); }} className="px-3 py-1 bg-gray-400 text-white rounded">Cancel</button>
        </div>
      )}
      {groups.map((g) => (
        <div key={g.id} className="border p-3 rounded mb-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{g.name}</h3>
            {isOwner && <button onClick={() => handleDeleteGroup(g.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>}
          </div>
          <p className="text-sm text-gray-500 mb-2">{members.filter(m => m.groupId === g.id).map(m => m.name).join(", ") || "No members"}</p>
          {/* Tasks */}
          {tasks[g.id]?.map(t => (
            <div key={t.id} className="flex justify-between p-2 bg-gray-50 border rounded mb-1">
              <span>{t.title} - {members.find(m => m.id === t.assignedTo)?.name || "Unassigned"}</span>
              {isOwner && <button onClick={() => handleDeleteTask(g.id, t.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Delete</button>}
            </div>
          ))}
          {isOwner && !addingTask[g.id] && <button onClick={() => setAddingTask(prev => ({ ...prev, [g.id]: true }))} className="px-3 py-1 bg-blue-600 text-white rounded text-sm mt-1">+ Add Task</button>}
          {isOwner && addingTask[g.id] && (
            <div className="mt-2 space-y-2">
              <input placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full p-2 border rounded" />
              <select value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} className="w-full p-2 border rounded">
                <option value="">Assign to member (optional)</option>
                {members.filter(m => m.groupId === g.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div className="flex space-x-2">
                <button onClick={() => handleAddTask(g.id)} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                <button onClick={() => setAddingTask(prev => ({ ...prev, [g.id]: false }))} className="px-3 py-1 bg-gray-400 text-white rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
