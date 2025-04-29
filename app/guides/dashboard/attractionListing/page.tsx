"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Image from "next/image";

import { attractionService } from "./attractionListing.service";
import { City, Attraction, Feedback, FormData } from "./AttractionListingTypes";

const GuideAttractionsPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token')
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    cityName: "",
    category: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);
  

  useEffect(() => {
    if (!isMounted || !user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesData, attractionsData, feedbackData] = await Promise.all([
          attractionService.getCities(),
          attractionService.getAttractions(user.id, token ?? undefined),
          token ? attractionService.getFeedback(token) : Promise.resolve([]),
        ]);

        setCities(citiesData);
        setAttractions(attractionsData);
        setFeedback(feedbackData);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, token, isMounted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clean up previous preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).slice(0, 5);
      setFiles(selectedFiles);
      setPreviewUrls(selectedFiles.map(file => URL.createObjectURL(file)));
    }
  };

  const handleRemoveImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (attraction: Attraction) => {
    setEditingId(attraction._id);
    setFormData({
      name: attraction.name,
      description: attraction.description,
      cityName: attraction.city?.cityName || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("You must be logged in to create/update an attraction");
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await attractionService.updateAttraction(
          editingId,
          formData,
          files,
          existingImages,
          token ?? undefined
        );
        toast.success("Attraction updated successfully!");
      } else {
        await attractionService.createAttraction(formData, files, user.id, token ?? undefined);
        toast.success("Attraction created successfully!");
      }

      handleCancelEdit();

      const attractionsData = await attractionService.getAttractions(user.id, token ?? undefined);
      setAttractions(attractionsData);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save attraction");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attraction?")) return;

    try {
      await attractionService.deleteAttraction(id, token ?? undefined);
      toast.success("Attraction deleted successfully");
      setAttractions(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete attraction");
    }
  };

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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <option value="Religious">Religious</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {editingId && existingImages.length > 0 && (
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
              {previewUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {attractions.map((attraction) => (
              <div key={attraction._id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48 w-full">
                  {(attraction.images ?? []).length > 0 ? (
                    <Image
                      src={(attraction.images ?? [])[0]}
                      alt={attraction.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{attraction.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{attraction.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {attraction.category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {typeof attraction.city === "string" ? attraction.city : attraction.city?.cityName || "Unknown city"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEdit(attraction)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(attraction._id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {feedback.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Feedback for Your Attractions</h2>
              <div className="space-y-4">
  {feedback.map((fb) => (
    <div key={fb._id} className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">
            {fb.attraction?.name || "Unknown Attraction"}
          </p>
          <p className="text-gray-600 mt-1">{fb.comments || "No comment provided"}</p>
        </div>
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < (fb.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        {new Date(fb.submittedAt || fb.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  ))}
</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GuideAttractionsPage;