"use client";
import UserSidebar from "@/components/UserSidebar";
import { useState, useEffect } from "react";
import { FaEye, FaCheck, FaTimes, FaUser, FaPhone, FaMoneyBillWave, FaSearch, FaInfoCircle, FaMapMarkerAlt, FaLanguage, FaList, FaIdCard } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Language {
  _id: string;
  languageName: string;
}

interface Activity {
  _id: string;
  activityName: string;
}

interface City {
  _id: string;
  locationName: string;
}

interface ProfilePic {
  public_id: string;
  url: string;
  secure_url: string;
  uploadedAt: string;
}

interface AadharCardPhoto {
  public_id: string;
  url: string;
  secure_url: string;
  uploadedAt: string;
}

interface Guide {
  _id: string;
  userId: User;
  languages: Language[];
  bio: string;
  serviceLocations: City[];
  profilePic?: ProfilePic;
  activities: Activity[];
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  active: string;
  rejectionReason?: string;
  lastVerifiedAt?: string;
  aadharCardPhoto?: AadharCardPhoto;
  phoneNumber?: string;
  maskedBankAccount: string;
  createdAt: string;
  updatedAt: string;
}

const GuidesPage = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:5000/api/profile/guides");
        if (!response.ok) {
          throw new Error("Failed to fetch guides");
        }
        const data = await response.json();
        setGuides(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        toast.error("Failed to load guides");
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filteredGuides = guides.filter(
    (guide) =>
      guide.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (guide: Guide) => {
    setSelectedGuide(guide);
    setShowDetailsModal(true);
  };

  const handleReview = (guide: Guide, actionType: "approve" | "reject") => {
    setSelectedGuide(guide);
    setAction(actionType);
    setReviewNotes("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedGuide) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/guides/${selectedGuide.userId._id}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: action === "approve" ? "approved" : "rejected",
            notes: reviewNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update active status");
      }

      const data = await response.json();
      toast.success(data.message || "Active status updated");

      setGuides(
        guides.map((guide) =>
          guide._id === selectedGuide._id
            ? {
                ...guide,
                active: action === "approve" ? "approved" : "rejected",
                rejectionReason: action === "reject" ? reviewNotes : guide.rejectionReason,
                lastVerifiedAt: new Date().toISOString(),
              }
            : guide
        )
      );

      setShowReviewModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update active status");
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <UserSidebar />
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold mb-6">Guide Verification</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <UserSidebar />
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold mb-6">Guide Verification</h1>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <UserSidebar />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Guide Verification</h1>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by name, email or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Guides Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Guide ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuides.length > 0 ? (
                filteredGuides.map((guide) => (
                  <tr key={guide._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {guide._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {guide.profilePic ? (
                            <img
                              src={guide.profilePic.secure_url}
                              alt={guide.userId.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <FaUser className="text-blue-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guide.userId.name}</div>
                          <div className="text-sm text-gray-500">{guide.userId.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          guide.active === "approved"
                            ? "bg-green-100 text-green-800"
                            : guide.active === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : guide.active === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {guide.active || "Not verified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guide.phoneNumber || "Not provided"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(guide)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
                        <button
                          onClick={() => handleReview(guide, "approve")}
                          disabled={guide.active !== "pending"}
                          className={`${
                            guide.active === "pending"
                              ? "text-green-600 hover:text-green-900"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <FaCheck className="inline mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleReview(guide, "reject")}
                          disabled={guide.active !== "pending"}
                          className={`${
                            guide.active === "pending"
                              ? "text-red-600 hover:text-red-900"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <FaTimes className="inline mr-1" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No guides found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {action === "approve" ? "Approve" : "Reject"} Guide
              </h2>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="font-medium">{selectedGuide.userId.name}</p>
                <p className="text-sm text-gray-600">{selectedGuide.userId.email}</p>
                <p className="text-sm text-gray-600">ID: {selectedGuide._id}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {action === "approve" ? "Approval Notes" : "Rejection Reason"}
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={action === "approve" ? "Optional notes..." : "Please specify the reason..."}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                    action === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={submitReview}
                >
                  {action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaUser className="mr-2" /> Guide Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaUser className="mr-2" /> Basic Information
                    </h3>
                    <dl className="mt-2 space-y-2">
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Guide ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 font-mono">
                          {selectedGuide._id}
                        </dd>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">User ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 font-mono">
                          {selectedGuide.userId._id}
                        </dd>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {selectedGuide.userId.name}
                        </dd>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {selectedGuide.userId.email}
                        </dd>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 text-sm sm:col-span-2">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              selectedGuide.active === "approved"
                                ? "bg-green-100 text-green-800"
                                : selectedGuide.active === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedGuide.active === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedGuide.active || "Not verified"}
                          </span>
                        </dd>
                      </div>
                      {selectedGuide.rejectionReason && (
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                            {selectedGuide.rejectionReason}
                          </dd>
                        </div>
                      )}
                      {selectedGuide.lastVerifiedAt && (
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Last Verified</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                            {new Date(selectedGuide.lastVerifiedAt).toLocaleString()}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaInfoCircle className="mr-2" /> Bio
                    </h3>
                    <p className="mt-2 text-sm text-gray-900">{selectedGuide.bio || "Not provided"}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaPhone className="mr-2" /> Contact Information
                    </h3>
                    <dl className="mt-2 space-y-2">
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {selectedGuide.phoneNumber || "Not provided"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {selectedGuide.profilePic && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <FaUser className="mr-2" /> Profile Picture
                      </h3>
                      <img
                        src={selectedGuide.profilePic.secure_url}
                        alt="Profile"
                        className="mt-2 rounded-md w-32 h-32 object-cover"
                      />
                    </div>
                  )}

                  {selectedGuide.aadharCardPhoto && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <FaIdCard className="mr-2" /> Aadhar Card Photo
                      </h3>
                      <img
                        src={selectedGuide.aadharCardPhoto.secure_url}
                        alt="Aadhar Card"
                        className="mt-2 rounded-md w-32 h-32 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaMoneyBillWave className="mr-2" /> Bank Details
                    </h3>
                    <dl className="mt-2 space-y-2">
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {selectedGuide.maskedBankAccount || "Not provided"}
                        </dd>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {selectedGuide.bankName || "Not provided"}
                        </dd>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">IFSC Code</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {selectedGuide.ifscCode || "Not provided"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaLanguage className="mr-2" /> Languages
                    </h3>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-900">
                      {selectedGuide.languages.length > 0 ? (
                        selectedGuide.languages.map((lang) => (
                          <li key={lang._id}>{lang.languageName}</li>
                        ))
                      ) : (
                        <li>Not provided</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaList className="mr-2" /> Activities
                    </h3>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-900">
                      {selectedGuide.activities.length > 0 ? (
                        selectedGuide.activities.map((activity) => (
                          <li key={activity._id}>{activity.activityName}</li>
                        ))
                      ) : (
                        <li>Not provided</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaMapMarkerAlt className="mr-2" /> Service Locations
                    </h3>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-900">
                      {selectedGuide.serviceLocations.length > 0 ? (
                        selectedGuide.serviceLocations.map((location) => (
                          <li key={location._id}>{location.locationName}</li>
                        ))
                      ) : (
                        <li>Not provided</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidesPage;