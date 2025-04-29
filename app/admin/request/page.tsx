"use client";
import { useState, useEffect } from "react";

import {
  FaEye,
  FaSync,
  FaUser,
  FaSearch,
  FaLanguage,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios, { AxiosError } from "axios";
import Image from "next/image";

interface Guide {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  active?: boolean;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  profileName?: string;
  languages?: { _id: string; languageName: string }[];
  bio?: string;
  maskedBankAccount?: string;
  aadharCardPhoto?: string;
  activities?: string[];
  serviceLocations?: string[];
}

interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  details?: Record<string, string>;
}

const GuidesPage = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/guides`);
      
      // Handle cases where response might not be in expected format
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      const data = response.data.data || response.data; // Handle different response structures
      
      if (!Array.isArray(data)) {
        throw new Error("Expected an array of guides but received different data structure");
      }
      
      // Mask bank account numbers client-side
      const maskedData = data.map((guide: Guide) => ({
        ...guide,
        maskedBankAccount: guide.bankAccountNumber
          ? `****${guide.bankAccountNumber.slice(-4)}`
          : undefined,
        bankAccountNumber: undefined,
      }));
      
      setGuides(maskedData);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiError>;
      
      const errorData: ApiError = {
        message: "Failed to load guides",
        statusCode: error.response?.status,
      };
      
      if (error.response) {
        // Server responded with a status code outside 2xx range
        errorData.message = error.response.data?.message || error.message;
        errorData.error = error.response.data?.error;
        errorData.details = error.response.data?.details;
      } else if (error.request) {
        // Request was made but no response received
        errorData.message = "No response received from server";
      }
      
      setError(errorData);
      toast.error(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleGuideStatus = async (guideId: string, currentActive: boolean | undefined) => {
    setToggling(guideId);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/guides/${guideId}/toggleStatus`
      );
      
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to toggle guide status");
      }
      
      toast.success(response.data.message || "Guide status updated successfully");
      setGuides((prev) =>
        prev.map((g) =>
          g._id === guideId
            ? { ...g, active: currentActive === undefined ? false : !currentActive }
            : g
        )
      );
    } catch (err: unknown) {
      const error = err as AxiosError<ApiError>;
      let errorMessage = "Failed to toggle guide status";
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.message;
        
        // Handle validation errors specifically
        if (error.response.status === 400 && error.response.data?.details) {
          errorMessage += ": " + Object.values(error.response.data.details).join(", ");
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setToggling(null);
    }
  };

  const filteredGuides = guides.filter((guide) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      guide.name?.toLowerCase().includes(searchLower) ||
      guide.email?.toLowerCase().includes(searchLower) ||
      guide._id.toLowerCase().includes(searchLower) ||
      guide.phoneNumber?.toLowerCase().includes(searchLower) ||
      guide.bankName?.toLowerCase().includes(searchLower) ||
      guide.firstName?.toLowerCase().includes(searchLower) ||
      guide.lastName?.toLowerCase().includes(searchLower) ||
      guide.profileName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex">
    
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Guide Management</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Error</p>
            <p>{error.message}</p>
            <button
              onClick={fetchGuides}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, ID, phone, bank, or profile"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guide
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGuides.length > 0 ? (
                    filteredGuides.map((guide) => (
                      <tr key={guide._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              {guide.profilePicture ? (
                                <Image
                                  src={guide.profilePicture}
                                  width={40}
                                  height={40}
                                  alt={guide.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <FaUser className="text-blue-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {guide.profileName || guide.name}
                              </div>
                              <div className="text-sm text-gray-500">{guide.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              guide.active === true
                                ? "bg-blue-100 text-blue-800"
                                : guide.active === false
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {guide.active === true ? "Active" : guide.active === false ? "Inactive" : "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {guide.phoneNumber || "Not provided"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedGuide(guide);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEye className="inline mr-1" /> View
                            </button>
                            <button
                              onClick={() => toggleGuideStatus(guide._id, guide.active)}
                              disabled={toggling === guide._id}
                              className={`text-indigo-600 hover:text-indigo-900 ${toggling === guide._id ? "opacity-50" : ""}`}
                            >
                              <FaSync className="inline mr-1" /> Toggle
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No guides found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showDetailsModal && selectedGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl min-h-[400px] max-h-[90vh] overflow-y-auto">
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
                <div>
                  <h3 className="text-lg font-medium mb-2">Basic Info</h3>
                  <p><strong>Profile Name:</strong> {selectedGuide.profileName || "N/A"}</p>
                  <p><strong>First Name:</strong> {selectedGuide.firstName || "N/A"}</p>
                  <p><strong>Last Name:</strong> {selectedGuide.lastName || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedGuide.email}</p>
                  <p><strong>Active:</strong> {selectedGuide.active === true ? "Yes" : selectedGuide.active === false ? "No" : "Unknown"}</p>
                  <p><strong>Phone:</strong> {selectedGuide.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Bank Info</h3>
                  <p><strong>Account No:</strong> {selectedGuide.maskedBankAccount || "Hidden"}</p>
                  <p><strong>Bank Name:</strong> {selectedGuide.bankName || "N/A"}</p>
                  <p><strong>IFSC:</strong> {selectedGuide.ifscCode || "N/A"}</p>
                </div>
                {selectedGuide.languages && selectedGuide.languages.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide.languages.map((lang) => (
                        <span
                          key={lang._id}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                        >
                          <FaLanguage className="mr-1" /> {lang.languageName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedGuide.bio && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-2">Bio</h3>
                    <p className="text-gray-700">{selectedGuide.bio}</p>
                  </div>
                )}
                {selectedGuide.aadharCardPhoto && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-2">Aadhar Card</h3>
                    <a
                      href={selectedGuide.aadharCardPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Aadhar Card
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidesPage;
