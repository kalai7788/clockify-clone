import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
  where,
  query,
  deleteDoc
} from "firebase/firestore";
import { useToast } from "../hooks/useToast";
import LoadingSpinner from "./LoadingSpinner";
import ConfirmationModal from "./ConfirmationModal";
import MemberRoleDropdown from "./MemberRoleDropdown";

export default function GroupsTab() {
  const [teamId, setTeamId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("groups");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { showToast } = useToast();

  const currentUserId = auth.currentUser?.uid;

  // Fetch team data
  useEffect(() => {
    if (!currentUserId) return;
    
    const unsubscribeUser = onSnapshot(doc(db, "users", currentUserId), (snap) => {
      try {
        if (snap.exists()) {
          setTeamId(snap.data().teamId || null);
        } else {
          setTeamId(null);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load user data");
        setLoading(false);
        console.error(err);
      }
    });

    return () => unsubscribeUser();
  }, [currentUserId]);

  // Load team details when teamId changes
  useEffect(() => {
    if (!teamId) return;

    const unsubscribeTeam = onSnapshot(
      doc(db, "teams", teamId), 
      (snap) => {
        if (snap.exists()) {
          setTeamName(snap.data().name || "Our Team");
        }
      }, 
      (err) => {
        setError("Failed to load team data");
        console.error(err);
      }
    );

    return () => unsubscribeTeam();
  }, [teamId]);
  
  // Listen for groups
  useEffect(() => {
    if (!teamId) return;
    
    const unsubscribeGroups = onSnapshot(
      collection(db, "teams", teamId, "groups"),
      (snapshot) => {
        setGroups(snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })));
      },
      (err) => {
        setError("Failed to load groups");
        console.error(err);
      }
    );

    return () => unsubscribeGroups();
  }, [teamId]);

  // Listen for members with proper error handling
  useEffect(() => {
    if (!teamId) return;
    
    const unsubscribeMembers = onSnapshot(
      doc(db, "teams", teamId),
      async (teamSnap) => {
        try {
          if (!teamSnap.exists()) {
            setError("Team document does not exist");
            return;
          }
          
          const { members: memberIds = [], roles = {} } = teamSnap.data();
          const users = await Promise.all(
            memberIds.map(async (uid) => {
              try {
                const userDoc = await getDoc(doc(db, "users", uid));
                if (!userDoc.exists()) return null;
                
                const userData = userDoc.data();
                return {
                  id: uid,
                  name: userData.name || "",
                  email: userData.email || "",
                  createdAt: userData.createdAt?.toDate() || new Date(),
                  role: roles[uid] || "member",
                };
              } catch (err) {
                console.error(`Failed to load user ${uid}:`, err);
                return null;
              }
            })
          );
          
          setMembers(users.filter(Boolean));
        } catch (err) {
          setError("Failed to load members");
          console.error(err);
        }
      },
      (err) => {
        setError("Failed to load members");
        console.error(err);
      }
    );

    return () => unsubscribeMembers();
  }, [teamId]);

  const isOwner = members.find((m) => m.id === currentUserId)?.role === "owner";
  const isAdmin = members.find((m) => m.id === currentUserId)?.role === "admin";

  // Team creation
  const createTeam = async () => {
    if (!teamName.trim()) {
      showToast("Please enter a team name", "error");
      return;
    }

    try {
      const teamRef = await addDoc(collection(db, "teams"), {
        name: teamName.trim(),
        createdAt: serverTimestamp(),
        members: [currentUserId],
        roles: { [currentUserId]: "owner" }
      });

      await updateDoc(doc(db, "users", currentUserId), {
        teamId: teamRef.id
      });

      setShowCreateTeamModal(false);
      setTeamName("");
      showToast("Team created successfully!", "success");
    } catch (err) {
      showToast("Failed to create team", "error");
      console.error(err);
    }
  };

  // Group management
  const addGroup = async () => {
    if (!newGroupName.trim()) {
      showToast("Please enter a group name", "error");
      return;
    }

    try {
      await addDoc(collection(db, "teams", teamId, "groups"), {
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        createdAt: serverTimestamp(),
        members: [currentUserId],
        createdBy: currentUserId,
      });
      setNewGroupName("");
      setNewGroupDescription("");
      showToast("Group created successfully", "success");
    } catch (err) {
      showToast("Failed to create group", "error");
      console.error(err);
    }
  };

  const updateGroup = async (groupId) => {
    if (!newGroupName.trim()) {
      showToast("Please enter a group name", "error");
      return;
    }

    try {
      await updateDoc(doc(db, "teams", teamId, "groups", groupId), {
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
      });
      setSelectedGroup(null);
      setNewGroupName("");
      setNewGroupDescription("");
      showToast("Group updated successfully", "success");
    } catch (err) {
      showToast("Failed to update group", "error");
      console.error(err);
    }
  };

  const removeGroup = async () => {
    try {
      await deleteDoc(doc(db, "teams", teamId, "groups", groupToDelete));
      setShowDeleteModal(false);
      showToast("Group deleted successfully", "success");
    } catch (err) {
      showToast("Failed to delete group", "error");
      console.error(err);
    }
  };

  // Member management
  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      showToast("Please enter an email", "error");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", inviteEmail.trim())
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
        showToast("No user found with that email", "error");
        return;
      }

      const userDoc = snap.docs[0];
      const uid = userDoc.id;
      const userData = userDoc.data();

      if (members.some(m => m.id === uid)) {
        showToast("User is already in the team", "error");
        return;
      }

      await updateDoc(doc(db, "users", uid), { teamId });
      await updateDoc(doc(db, "teams", teamId), {
        members: arrayUnion(uid),
        roles: { ...(await getDoc(doc(db, "teams", teamId))).data().roles, [uid]: "member" }
      });

      // Add the new member to local state immediately
      setMembers(prev => [...prev, {
        id: uid,
        name: userData.name || "",
        email: userData.email,
        role: "member",
        createdAt: userData.createdAt?.toDate() || new Date()
      }]);

      setInviteEmail("");
      setShowInviteModal(false);
      showToast("Member invited successfully", "success");
    } catch (err) {
      showToast("Failed to invite member", "error");
      console.error(err);
    }
  };

  const changeRole = async (uid, role) => {
    try {
      const teamRef = doc(db, "teams", teamId);
      const teamSnap = await getDoc(teamRef);
      const roles = { ...teamSnap.data().roles };

      if (role === "owner") {
        // Transfer ownership
        for (const id in roles) {
          if (roles[id] === "owner") roles[id] = "admin";
        }
      }
      
      roles[uid] = role;
      await updateDoc(teamRef, { roles });
      
      // Update local state
      setMembers(prev => prev.map(member => 
        member.id === uid ? {...member, role} : member
      ));
      
      showToast("Role updated successfully", "success");
    } catch (err) {
      showToast("Failed to update role", "error");
      console.error(err);
    }
  };

  const removeMember = async (uid) => {
    try {
      const teamRef = doc(db, "teams", teamId);
      const teamSnap = await getDoc(teamRef);
      const data = teamSnap.data();
      
      await updateDoc(teamRef, {
        members: data.members.filter(m => m !== uid),
        roles: Object.fromEntries(
          Object.entries(data.roles).filter(([id]) => id !== uid)
        )
      });
      
      await updateDoc(doc(db, "users", uid), { teamId: null });
      
      // Remove from local state
      setMembers(prev => prev.filter(member => member.id !== uid));
      
      showToast("Member removed successfully", "success");
    } catch (err) {
      showToast("Failed to remove member", "error");
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  if (!teamId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to Team Management</h1>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Create New Team
            </button>
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter invite code"
                className="w-full px-4 py-2 border rounded-md"
              />
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">
                Join Existing Team
              </button>
            </div>
          </div>
        </div>

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Awesome Team"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateTeamModal(false)}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTeam}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{teamName}</h1>
        {isOwner && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Invite Members
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("groups")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "groups"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "members"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Members
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "groups" ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Groups</h2>
                {(isOwner || isAdmin) && (
                  <button
                    onClick={() => {
                      setSelectedGroup(null);
                      setNewGroupName("");
                      setNewGroupDescription("");
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create Group
                  </button>
                )}
              </div>

              {(selectedGroup === null && (isOwner || isAdmin)) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Create New Group</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Marketing Team"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        placeholder="What's this group for?"
                        className="w-full px-3 py-2 border rounded-md"
                        rows="3"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setNewGroupName("");
                          setNewGroupDescription("");
                        }}
                        className="px-4 py-2 border rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addGroup}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Create Group
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedGroup && (isOwner || isAdmin) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Edit Group</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        rows="3"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setSelectedGroup(null)}
                        className="px-4 py-2 border rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateGroup(selectedGroup)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          {group.description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                        {(isOwner || isAdmin) && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedGroup(group.id);
                                setNewGroupName(group.name);
                                setNewGroupDescription(group.description || "");
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setGroupToDelete(group.id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {group.members?.length || 0} members
                        </span>
                        <span className="text-xs text-gray-400">
                          Created: {group.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Team Members</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      {(isOwner || isAdmin) && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600">
                                {(member.name || member.email || "").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name || "No name"}
                              </div>
                              <div className="text-sm text-gray-500">
                                Joined: {member.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.email || "No email"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.role === "owner"
                                ? "bg-purple-100 text-purple-800"
                                : member.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>
                        {(isOwner || isAdmin) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {member.id !== currentUserId && (
                              <div className="flex space-x-2">
                                <MemberRoleDropdown
                                  currentRole={member.role}
                                  onChange={(role) => changeRole(member.id, role)}
                                  disabled={member.role === "owner" && !isOwner}
                                />
                                <button
                                  onClick={() => removeMember(member.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Invite Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={inviteMember}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={removeGroup}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
}
