"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GuideAttractionsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cityName: "",
    category: "",
   
  });
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track which attraction is being edited

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesResponse, attractionsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/cities`),
          user?.id && fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions/guide/${user.id}`),
        ]);

        if (!citiesResponse.ok) throw new Error("Failed to fetch cities");
        const citiesData = await citiesResponse.json();
        setCities(citiesData.data || []);

        if (attractionsResponse) {
          if (!attractionsResponse.ok) throw new Error("Failed to fetch attractions");
          const attractionsData = await attractionsResponse.json();
          setAttractions(Array.isArray(attractionsData) ? attractionsData : []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, isMounted]);

  const handleFileChange = (e) => {
    // Clean up previous preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).slice(0, 5);
      setFiles(selectedFiles);
      setPreviewUrls(selectedFiles.map(file => URL.createObjectURL(file)));
    }
  };

  const handleRemoveImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (attraction) => {
    setEditingId(attraction._id);
    setFormData({
      name: attraction.name,
      description: attraction.description,
      cityName: attraction.cityName,
      category: attraction.category,
   
    });
    setExistingImages(attraction.images || []);
    setFiles([]);
    setPreviewUrls([]);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      cityName: "",
      category: "",
      
    });
    setExistingImages([]);
    setFiles([]);
    setPreviewUrls([]);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("You must be logged in to create/update an attraction");
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      if (editingId) {
        // For edit, append existing images that weren't removed
        existingImages.forEach(image => {
          formDataToSend.append("existingImages", image);
        });
      } else {
        // For create, just append guideId
        formDataToSend.append("guideId", user.id);
      }
      
      // Append new files
      files.forEach(file => {
        formDataToSend.append("images", file);
      });

      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/attractions/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/attractions`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${editingId ? 'update' : 'create'} attraction`);
      }

      toast.success(`Attraction ${editingId ? 'updated' : 'created'} successfully!`);
      
      // Reset form
      handleCancelEdit();

      // Refresh attractions list
      const attractionsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attractions/guide/${user.id}`
      );
      const attractionsData = await attractionsRes.json();
      setAttractions(Array.isArray(attractionsData) ? attractionsData : []);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this attraction?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attractions/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete attraction");
      }

      toast.success("Attraction deleted successfully");
      setAttractions(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error(error.message);
    }
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Attractions</h1>
        <button
          onClick={() => {
            if (editingId) {
              handleCancelEdit();
            } else {
              setShowForm(!showForm);
            }
          }}
          className="px-4 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 transition-colors"
          disabled={loading}
        >
          {editingId ? "Cancel Edit" : showForm ? "Cancel" : "Create New"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Attraction" : "Create New Attraction"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields remain the same as before */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attraction Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <select
                value={formData.cityName}
                onChange={(e) =>
                  setFormData({ ...formData, cityName: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city._id} value={city.cityName}>
                    {city.cityName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select a category</option>
                <option value="Adventure">Adventure</option>
                <option value="Historical">Historical</option>
                <option value="Cultural">Cultural</option>
                <option value="Nature">Nature</option>
              </select>
            </div>

           

            {/* Show existing images when editing */}
            {editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Existing Images
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative w-20 h-20 group">
                      <Image
                        src={image}
                        alt={`Existing image ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editingId ? "Add New Images (Max 5)" : "Images (Max 5)"}
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={loading}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                      onLoad={() => URL.revokeObjectURL(url)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingId ? "Updating..." : "Processing..."}
                </span>
              ) : (
                editingId ? "Update Attraction" : "Create Attraction"
              )}
            </button>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : attractions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No attractions created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <div key={attraction._id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={attraction.images[0] || "/placeholder.jpg"}
                  alt={attraction.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{attraction.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{attraction.description}</p>
                <div className="flex justify-between items-center mb-3">
              
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {attraction.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => handleEdit(attraction)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(attraction._id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuideAttractionsPage;