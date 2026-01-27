import React, { useEffect, useState } from "react";
import Sidebarcomp from "../sidenav";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBuilding, 
  faPlus, 
  faTrash, 
  faEdit, 
  faServer,
  faCheckCircle,
  faTimesCircle,
  faLink
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [slots, setSlots] = useState([]);
  const [clientAssignments, setClientAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({
    client_name: "",
    client_code: "",
    description: ""
  });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [resettingSlots, setResettingSlots] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, slotsRes, assignmentsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/clients`),
        axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/slots`),
        axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/client-assignments`)
      ]);
      setClients(clientsRes.data);
      setSlots(slotsRes.data);
      setClientAssignments(assignmentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new client
  const handleAddClient = async () => {
    if (!newClient.client_name || !newClient.client_code) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/clients`, newClient);
      setShowAddModal(false);
      setNewClient({ client_name: "", client_code: "", description: "" });
      fetchData();
      alert("Client added successfully!");
    } catch (error) {
      console.error("Error adding client:", error);
      alert(error.response?.data?.error || "Failed to add client");
    }
  };

  // Delete client
  const handleDeleteClient = async (clientId) => {
    if (!confirm("Are you sure you want to delete this client? This will also remove all slot assignments.")) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_API_URL}/clients/${clientId}`);
      fetchData();
      alert("Client deleted successfully!");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert(error.response?.data?.error || "Failed to delete client");
    }
  };

  // Open assign slots modal
  const handleOpenAssignModal = (client) => {
    setSelectedClient(client);
    // Pre-select already assigned slots for this client
    const assignedSlotIds = clientAssignments
      .filter(a => a.client_id === client.client_id)
      .map(a => a.slot_id);
    setSelectedSlots(assignedSlotIds);
    setShowAssignModal(true);
  };

  // Toggle slot selection
  const toggleSlotSelection = (slotId) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  // Save slot assignments
  const handleSaveAssignments = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/client-assignments`, {
        client_id: selectedClient.client_id,
        slot_ids: selectedSlots
      });
      setShowAssignModal(false);
      setSelectedClient(null);
      setSelectedSlots([]);
      fetchData();
      alert("Slots assigned successfully!");
    } catch (error) {
      console.error("Error assigning slots:", error);
      alert(error.response?.data?.error || "Failed to assign slots");
    }
  };

  // Get assigned slots count for a client
  const getAssignedSlotsCount = (clientId) => {
    return clientAssignments.filter(a => a.client_id === clientId).length;
  };

  // Get available slots count for a client
  const getAvailableSlotsCount = (clientId) => {
    const assignedSlots = clientAssignments.filter(a => a.client_id === clientId);
    return assignedSlots.filter(a => {
      const slot = slots.find(s => s.id === a.slot_id);
      return slot && slot.is_utilized === 0;
    }).length;
  };

  // Check if slot is assigned to any client
  const isSlotAssigned = (slotId) => {
    return clientAssignments.some(a => a.slot_id === slotId);
  };

  // Get client name for an assigned slot
  const getSlotClientName = (slotId) => {
    const assignment = clientAssignments.find(a => a.slot_id === slotId);
    if (!assignment) return null;
    const client = clients.find(c => c.client_id === assignment.client_id);
    return client?.client_name || "Unknown";
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebarcomp />

      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Client Management
          </h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add New Client
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Clients Table */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Registered Clients</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>S.No</th>
                        <th>Client Name</th>
                        <th>Client Code</th>
                        <th>Description</th>
                        <th>Assigned Questions</th>
                        <th>Available Slots</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.length > 0 ? (
                        clients.map((client, idx) => (
                          <tr key={client.client_id}>
                            <td>{idx + 1}</td>
                            <td>{client.client_name}</td>
                            <td>
                              <code className="bg-light px-2 py-1 rounded">
                                {client.client_code}
                              </code>
                            </td>
                            <td>{client.description || "-"}</td>
                            <td>
                              <span className="badge bg-info">
                                {getAssignedSlotsCount(client.client_id)}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-success">
                                {getAvailableSlotsCount(client.client_id)}
                              </span>
                            </td>
                            <td>
                              {client.is_active ? (
                                <span className="badge bg-success">
                                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="badge bg-secondary">
                                  <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleOpenAssignModal(client)}
                                title="Assign Slots"
                              >
                                <FontAwesomeIcon icon={faLink} />
                              </button>
                              {/* <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteClient(client.client_id)}
                                title="Delete Client"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button> */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">
                            No clients registered yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Slots Overview */}
            <div className="card shadow-sm">
              <div className="card-header bg-secondary text-white d-flex align-items-center justify-content-between">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faServer} className="me-2" />
                  Available Questions Overview
                </h5>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={async () => {
                    if (!confirm("Reset all slots to unused?")) return;
                    try {
                      setResettingSlots(true);
                      await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/slots/reset`);
                      alert("Reset all slot utilizations.");
                      fetchData();
                    } catch (error) {
                      console.error("Error resetting slots:", error);
                      alert(error.response?.data?.error || "Failed to reset slots");
                    } finally {
                      setResettingSlots(false);
                    }
                  }}
                  disabled={resettingSlots}
                >
                  {resettingSlots ? "Resetting..." : "Reset Utilization"}
                </button>
              </div>
              <div className="card-body">
                <div className="row">
                  {slots.map((slot) => (
                    <div key={slot.id} className="col-md-3 col-sm-6 mb-3">
                      <div 
                        className={`card h-100 ${
                          slot.is_utilized 
                            ? "border-danger" 
                            : isSlotAssigned(slot.id) 
                              ? "border-primary" 
                              : "border-success"
                        }`}
                      >
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="fw-bold">Question {slot.id}</small>
                            <span 
                              className={`badge ${
                                slot.is_utilized 
                                  ? "bg-danger" 
                                  : isSlotAssigned(slot.id) 
                                    ? "bg-primary" 
                                    : "bg-success"
                              }`}
                            >
                              {slot.is_utilized 
                                ? "In Use" 
                                : isSlotAssigned(slot.id) 
                                  ? "Assigned" 
                                  : "Free"}
                            </span>
                          </div>
                          {/* <small className="text-muted d-block">
                            Port: {slot.docker_port}/{slot.frontend_port}
                          </small> */}
                          {isSlotAssigned(slot.id) && (
                            <small className="text-primary d-block">
                              Client: {getSlotClientName(slot.id)}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Client</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Client Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClient.client_name}
                      onChange={(e) => setNewClient({...newClient, client_name: e.target.value})}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Client Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClient.client_code}
                      onChange={(e) => setNewClient({...newClient, client_code: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                      placeholder="e.g., ABC_CORP"
                    />
                    <small className="text-muted">
                      This code will be used in API calls to identify the client
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={newClient.description}
                      onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                      placeholder="Optional description"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleAddClient}
                  >
                    Add Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Slots Modal */}
        {showAssignModal && selectedClient && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Assign Slots to: {selectedClient.client_name}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedClient(null);
                      setSelectedSlots([]);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Select the questions you want to assign to this client. 
                    Only questions assigned to this client will be used when the client triggers the assessment.
                  </p>
                  <div className="row">
                    {slots.map((slot) => {
                      const assignedToOther = isSlotAssigned(slot.id) && 
                        !clientAssignments.some(a => 
                          a.slot_id === slot.id && a.client_id === selectedClient.client_id
                        );
                      
                      return (
                        <div key={slot.id} className="col-md-4 col-sm-6 mb-2">
                          <div 
                            className={`card ${
                              selectedSlots.includes(slot.id) 
                                ? "border-primary bg-light" 
                                : assignedToOther 
                                  ? "border-warning bg-warning bg-opacity-10" 
                                  : ""
                            }`}
                            style={{ 
                              cursor: assignedToOther ? "not-allowed" : "pointer",
                              opacity: assignedToOther ? 0.6 : 1
                            }}
                            onClick={() => !assignedToOther && toggleSlotSelection(slot.id)}
                          >
                            <div className="card-body p-2">
                              <div className="d-flex align-items-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input me-2"
                                  checked={selectedSlots.includes(slot.id)}
                                  onChange={() => !assignedToOther && toggleSlotSelection(slot.id)}
                                  disabled={assignedToOther}
                                />
                                <div>
                                  <small className="fw-bold">Question {slot.id}</small>
                                  {/* <small className="text-muted d-block">
                                    {slot.docker_port}/{slot.frontend_port}
                                  </small> */}
                                  {assignedToOther && (
                                    <small className="text-warning">
                                      Assigned to: {getSlotClientName(slot.id)}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="modal-footer">
                  <span className="me-auto text-muted">
                    {selectedSlots.length} slot(s) selected
                  </span>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedClient(null);
                      setSelectedSlots([]);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSaveAssignments}
                  >
                    Save Assignments
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientManagement;
