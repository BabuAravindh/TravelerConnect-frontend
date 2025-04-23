// components/RefundManagement.jsx
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const RefundManagement = () => {
  // State management
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ adminComment: "" });
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    refunded: 0,
    rejected: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  // Fetch refunds data
  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/refund`);
      const refundData = Array.isArray(response.data.data) ? response.data.data : [];
      setRefunds(refundData);
      setStats({
        total: refundData.length,
        pending: refundData.filter((r) => r.status === "pending").length,
        refunded: refundData.filter((r) => r.status === "refunded").length,
        rejected: refundData.filter((r) => r.status === "rejected").length,
      });
    } catch (error) {
      alert("Failed to fetch refunds");
      console.error("Fetch refunds error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const isImage = selectedFile.type.startsWith("image/");
      const isLt5M = selectedFile.size / 1024 / 1024 < 5;
      if (!isImage) {
        alert("Only image files are allowed!");
        return;
      }
      if (!isLt5M) {
        alert("Image must be smaller than 5MB!");
        return;
      }
      setFile(selectedFile);
    }
  };

  // Handle refund update submission
  const handleUpdateRefund = async (e) => {
    e.preventDefault();
    if (!formData.adminComment) {
      alert("Admin comment is required");
      return;
    }
    if (formData.adminComment.length > 500) {
      alert("Comment must be less than 500 characters");
      return;
    }
    setUploadLoading(true);
    try {
      if (!selectedRefund?._id) throw new Error("No refund selected");

      const data = new FormData();
      data.append("adminComment", formData.adminComment);

      if (file) {
        data.append("proof", file);
      } else if (selectedRefund?.status === "pending") {
        alert("Proof image is required for pending refunds");
        setUploadLoading(false);
        return;
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/refund/proof/${selectedRefund._id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 10000 }
      );

      alert(response.data.message || "Refund processed successfully");
      fetchRefunds();
      setIsModalOpen(false);
      setFile(null);
      setFormData({ adminComment: "" });
    } catch (error) {
      console.error("Update refund error:", error);
      alert(error.response?.data?.error || "Failed to process refund");
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle table sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sort refunds
  const sortedRefunds = [...refunds].sort((a, b) => {
    if (sortConfig.key === "createdAt") {
      return sortConfig.direction === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  // Paginate refunds
  const paginatedRefunds = sortedRefunds.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(refunds.length / pageSize);

  // Open modal
  const openModal = (refund) => {
    setSelectedRefund(refund);
    setFormData({ adminComment: refund.adminComment || "" });
    setFile(null);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setFormData({ adminComment: "" });
  };

  // Status styling
  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" };
      case "refunded":
        return { bg: "bg-green-100", text: "text-green-800", label: "Refunded" };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-800", label: "Rejected" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: status };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Refund Management</h1>
        <button
          onClick={fetchRefunds}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition animate-pulse hover:animate-none"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5m11 6v5h-5m0-5h5m-5 0v5m-7-13l-4 4m0 0l4 4m-4-4h18" />
            </svg>
          )}
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { title: "Total Refunds", value: stats.total, color: "primary" },
          { title: "Pending", value: stats.pending, color: "yellow-600" },
          { title: "Refunded", value: stats.refunded, color: "green-600" },
          { title: "Rejected", value: stats.rejected, color: "red-600" },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow animate-fade-in"
          >
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <p className={`text-2xl font-semibold text-${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Refunds Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { label: "Booking ID", key: "bookingId" },
                  { label: "User", key: "user" },
                  { label: "Amount", key: "amount" },
                  { label: "Status", key: "status" },
                  { label: "Request Date", key: "createdAt", sortable: true },
                  { label: "Actions", key: "actions" },
                ].map((header) => (
                  <th
                    key={header.key}
                    className={`px-4 py-3 text-sm font-medium text-gray-700 ${header.sortable ? "cursor-pointer hover:text-primary" : ""}`}
                    onClick={header.sortable ? () => handleSort(header.key) : undefined}
                  >
                    <div className="flex items-center">
                      {header.label}
                      {header.sortable && sortConfig.key === header.key && (
                        <svg
                          className="h-4 w-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={sortConfig.direction === "asc" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <svg className="animate-spin h-8 w-8 mx-auto text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </td>
                </tr>
              ) : paginatedRefunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No refunds found
                  </td>
                </tr>
              ) : (
                paginatedRefunds.map((refund) => {
                  const statusStyles = getStatusStyles(refund.status);
                  return (
                    <tr key={refund._id} className="border-t hover:bg-gray-50 transition animate-fade-in">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {refund.bookingId?._id?.slice(0, 8) || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{refund.bookingId?.userId?.name || "N/A"}</div>
                            <div className="text-gray-500 text-xs">{refund.bookingId?.userId?.email || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        ${refund.amount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                          {statusStyles.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <button
                          onClick={() => openModal(refund)}
                          className={`px-3 py-1 rounded-lg text-white text-xs font-medium transition animate-pulse hover:animate-none ${
                            refund.status === "pending" ? "bg-primary" : "bg-button"
                          } hover:bg-opacity-90`}
                        >
                          {refund.status === "pending" ? "Process" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, refunds.length)} of {refunds.length} refunds
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-button text-white rounded-lg disabled:opacity-50 hover:bg-opacity-90 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-button text-white rounded-lg disabled:opacity-50 hover:bg-opacity-90 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 animate-slide-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Refund Details #{selectedRefund?._id?.slice(-8) || ""}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateRefund}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                  <input
                    type="text"
                    value={selectedRefund?.bookingId?._id || "N/A"}
                    disabled
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="text"
                    value={`$${selectedRefund?.amount?.toFixed(2) || "0.00"}`}
                    disabled
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{selectedRefund?.bookingId?.userId?.name || "N/A"}</div>
                    <div className="text-gray-500 text-sm">{selectedRefund?.bookingId?.userId?.email || "N/A"}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <input
                    type="text"
                    value={selectedRefund?.status?.toUpperCase() || ""}
                    disabled
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Date</label>
                  <input
                    type="text"
                    value={selectedRefund?.createdAt ? new Date(selectedRefund.createdAt).toLocaleString() : "N/A"}
                    disabled
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                  />
                </div>
              </div>
              {selectedRefund?.proof && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Refund Proof</label>
                  <div className="flex items-end gap-4">
                    <img
                      src={selectedRefund.proof}
                      alt="Refund proof"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <a
                      href={selectedRefund.proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Admin Comment</label>
                <textarea
                  name="adminComment"
                  value={formData.adminComment}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter processing details..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              {selectedRefund?.status === "pending" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Upload Refund Proof</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-button file:text-white file:hover:bg-opacity-90"
                  />
                  <p className="mt-2 text-xs text-gray-500">Only image files (JPG/PNG) under 5MB are allowed</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedRefund?.status !== "pending" || uploadLoading}
                  className="px-4 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition animate-pulse hover:animate-none"
                >
                  {uploadLoading ? (
                    <svg className="animate-spin h-5 w-5 inline mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : null}
                  {selectedRefund?.status === "pending" ? "Process Refund" : "Update Comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundManagement;