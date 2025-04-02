"use client";
import UserSidebar from "@/components/UserSidebar";
import { useState, useEffect } from "react";
import { FaEye, FaCheck, FaTimes, FaTrash, FaUser, FaMapMarkerAlt, FaLanguage, FaCertificate, FaMoneyBillWave, FaCalendarAlt, FaIdCard, FaListAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  email?: string;
  name?: string;
}

interface Guide {
  _id: string;
  userId: User | null; // Make userId nullable
  languages: string[];
  activities: string[];
  serviceLocations: string[];
  aadharCardPhoto: string;
  bankAccountNumber: string;
  bio: string;
  status: string;
  submittedAt: string;
  reviewNotes?: string;
  reviewedAt?: string;
  experience?: string;
  expertise?: string[];
  certifications?: string[];
  locations?: string[];
  availability?: string;
  pricing?: number;
  govId?: string;
  __v?: number;
}

const GuidesPage = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/requests`);
        if (!response.ok) {
          throw new Error('Failed to fetch guides');
        }
        const data = await response.json();
        setGuides(data.data || []); // Ensure we always have an array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error('Failed to load guides');
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const handleReview = (guide: Guide, actionType: "approve" | "reject") => {
    setSelectedGuide(guide);
    setAction(actionType);
    setReviewNotes(guide.reviewNotes || "");
    setShowReviewModal(true);
  };

  const handleViewDetails = (guide: Guide) => {
    setSelectedGuide(guide);
    setShowDetailsModal(true);
  };

  const submitReview = async () => {
    if (!selectedGuide) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guide/requests/${selectedGuide._id}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: action === "approve" ? "approved" : "rejected",
            reviewNotes: reviewNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const data = await response.json();
      toast.success(data.message);

      // Update the guide in state
      setGuides(guides.map(guide => 
        guide._id === selectedGuide._id 
          ? { 
              ...guide, 
              status: action === "approve" ? "approved" : "rejected",
              reviewNotes,
              reviewedAt: new Date().toISOString()
            } 
          : guide
      ));

      setShowReviewModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <div className="p-6 flex-1">
          <h1 className="text-3xl font-semibold mb-6">Guides Management</h1>
          <p>Loading guides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <div className="p-6 flex-1">
          <h1 className="text-3xl font-semibold mb-6">Guides Management</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
  

      {/* Main Content */}
      <div className="p-6 flex-1">
        <h1 className="text-3xl font-semibold mb-6">Guides Management</h1>

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Submitted At</th>
                <th className="p-3 text-left">Bio</th>
                <th className="p-3 text-left">Activities</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide, index) => (
                <tr
                  key={guide._id}
                  className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                >
                  <td className="p-3">     {guide.userId?.email || 'No email'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      guide.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : guide.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {guide.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(guide.submittedAt).toLocaleDateString()}</td>
                  <td className="p-3">{guide.bio?.substring(0, 30)}{guide.bio && guide.bio.length > 30 ? '...' : ''}</td>
                  <td className="p-3">
                    {guide.activities?.slice(0, 2).join(', ')}
                    {guide.activities && guide.activities.length > 2 ? '...' : ''}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button 
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleViewDetails(guide)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="text-green-500 hover:text-green-700 disabled:text-gray-300"
                        disabled={guide.status !== 'pending'}
                        onClick={() => handleReview(guide, "approve")}
                        title="Approve"
                      >
                        <FaCheck />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                        disabled={guide.status !== 'pending'}
                        onClick={() => handleReview(guide, "reject")}
                        title="Reject"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {action === "approve" ? "Approve" : "Reject"} Guide Request
              </h2>
              <p className="mb-2">Guide:{selectedGuide.userId?.email || 'Not available'}</p>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Review Notes</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter review notes..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded text-white ${
                    action === "approve" 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  onClick={submitReview}
                >
                  {action === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FaUser /> Guide Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FaUser /> Basic Information
                  </h3>
                  <p><span className="font-medium">Email:</span> {selectedGuide?.userId?.email}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedGuide.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedGuide.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedGuide.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Submitted At:</span> {new Date(selectedGuide.submittedAt).toLocaleString()}</p>
                  {selectedGuide.reviewedAt && (
                    <p><span className="font-medium">Reviewed At:</span> {new Date(selectedGuide.reviewedAt).toLocaleString()}</p>
                  )}
                  {selectedGuide.reviewNotes && (
                    <p><span className="font-medium">Review Notes:</span> {selectedGuide.reviewNotes}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FaListAlt /> Bio
                  </h3>
                  <p>{selectedGuide.bio || "Not provided"}</p>
                </div>

                {/* Activities */}
                {selectedGuide.activities && selectedGuide.activities.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaListAlt /> Activities
                    </h3>
                    <ul className="list-disc pl-5">
                      {selectedGuide.activities.map((activity, i) => (
                        <li key={i}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Languages */}
                {selectedGuide.languages && selectedGuide.languages.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaLanguage /> Languages
                    </h3>
                    <ul className="list-disc pl-5">
                      {selectedGuide.languages.map((language, i) => (
                        <li key={i}>{language}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Service Locations */}
                {selectedGuide.serviceLocations && selectedGuide.serviceLocations.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt /> Service Locations
                    </h3>
                    <ul className="list-disc pl-5">
                      {selectedGuide.serviceLocations.map((location, i) => (
                        <li key={i}>{location}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Experience */}
                {selectedGuide.experience && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaUser /> Experience
                    </h3>
                    <p>{selectedGuide.experience}</p>
                  </div>
                )}

                {/* Expertise */}
                {selectedGuide.expertise && selectedGuide.expertise.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaCertificate /> Expertise
                    </h3>
                    <ul className="list-disc pl-5">
                      {selectedGuide.expertise.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Certifications */}
                {selectedGuide.certifications && selectedGuide.certifications.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaCertificate /> Certifications
                    </h3>
                    <ul className="list-disc pl-5">
                      {selectedGuide.certifications.map((cert, i) => (
                        <li key={i}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pricing */}
                {selectedGuide.pricing && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaMoneyBillWave /> Pricing
                    </h3>
                    <p>${selectedGuide.pricing} per hour</p>
                  </div>
                )}

                {/* Availability */}
                {selectedGuide.availability && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaCalendarAlt /> Availability
                    </h3>
                    <p>{selectedGuide.availability}</p>
                  </div>
                )}

                {/* Government ID */}
                {selectedGuide.govId && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaIdCard /> Government ID
                    </h3>
                    <p>{selectedGuide.govId}</p>
                  </div>
                )}

                {/* Bank Details */}
                {selectedGuide.bankAccountNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaMoneyBillWave /> Bank Details
                    </h3>
                    <p><span className="font-medium">Account Number:</span> {selectedGuide.bankAccountNumber}</p>
                  </div>
                )}

                {/* Aadhar Card */}
                {selectedGuide.aadharCardPhoto && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaIdCard /> Aadhar Card
                    </h3>
                    <img 
                      src={selectedGuide.aadharCardPhoto} 
                      alt="Aadhar Card" 
                      className="mt-2 rounded border border-gray-300 max-w-full h-auto"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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