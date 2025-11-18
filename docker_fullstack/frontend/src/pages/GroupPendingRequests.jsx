import { useEffect } from "react";
import { useGroup } from "../contexts/GroupContext";
import GroupSidebar from "../components/GroupSidebar";
import "./Settings.css";
import "./Group.css";

function GroupPendingRequests() {
  const {
    group,
    loading,
    joinRequests,
    canManageRequests,
    fetchJoinRequests,
    handleApproveRequest,
    handleRejectRequest,
  } = useGroup();

  useEffect(() => {
    fetchJoinRequests();
  }, []);

  if (loading) {
    return (
      <main className="settings-page">
        <div className="settings-content">
          <p>Loading pending requests...</p>
        </div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="settings-page">
        <div className="settings-content">
          <p>Group not found</p>
        </div>
      </main>
    );
  }

  const canManage = canManageRequests();

  return (
    <div>
      <main className="settings-page">
        <div className="settings-content">
          <GroupSidebar group={group} />
          <div className="settings-form">
            
            {canManage ? (
              <section className="settings-section">
                <header className="settings-section-header">
                  <h2 className="settings-section-title">Pending Requests ({joinRequests.length})</h2>
                </header>
                <div className="settings-field">
                  {joinRequests.length > 0 && (
                    <div className="group-members-list" style={{ marginTop: '1rem' }}>
                      {joinRequests.map((request) => (
                        <div key={request.id} className="group-member-item">
                          <div className="group-member-info">
                            <p className="group-member-username">{request.username}</p>
                            {request.email && (
                              <p className="group-member-joined" style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                {request.email}
                              </p>
                            )}
                            <p className="group-member-joined">
                              Requested: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="settings-actions" style={{ gap: '0.5rem' }}>
                            <button
                              className="settings-button settings-button-save"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="settings-button settings-button-cancel"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="settings-section">
                <header className="settings-section-header">
                  <h2 className="settings-section-title">No permissions</h2>
                  <p className="settings-section-desc">You need to be an owner or admin to view pending requests</p>
                </header>
              </section>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default GroupPendingRequests;

