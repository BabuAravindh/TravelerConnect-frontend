"use client";
import { useState, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Bus, Train, Plane, Ship, Bike, Car, Trash2, Plus, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { routeService } from './destinationRoutes.service';
import { City, Route, Feedback, RouteFormData } from './destinationRoutesTypes';

const transportIcons: Record<'Bus' | 'Train' | 'Flight' | 'Ferry' | 'Private Vehicle' | 'Bicycle' | 'Motorcycle', JSX.Element> = {
  Bus: <Bus className="text-blue-500" />,
  Train: <Train className="text-green-500" />,
  Flight: <Plane className="text-red-500" />,
  Ferry: <Ship className="text-purple-500" />,
  'Private Vehicle': <Car className="text-yellow-500" />,
  Bicycle: <Bike className="text-teal-500" />,
  Motorcycle: <Bike className="text-orange-500" />,
};

export default function GuideRoutesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RouteFormData>({
    from: '',
    to: '',
    transports: [{ mode: '', duration: '', details: '' }],
  });
  const [editFormData, setEditFormData] = useState<RouteFormData>({
    from: '',
    to: '',
    transports: [{ mode: '', duration: '', details: '' }],
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const [citiesData, routesData, feedbackData] = await Promise.all([
          routeService.getCities(),
          routeService.getRoutes(user.id, token),
          routeService.getFeedback(token),
        ]);

        setCities(citiesData);
        setRoutes(routesData);
        setFeedback(feedbackData);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
    const { name, value } = e.target;
    const updatedTransports = [...formData.transports];
    updatedTransports[index] = { ...updatedTransports[index], [name]: value };

    setFormData({
      ...formData,
      transports: updatedTransports,
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
    const { name, value } = e.target;
    const updatedTransports = [...editFormData.transports];
    updatedTransports[index] = { ...updatedTransports[index], [name]: value };

    setEditFormData({
      ...editFormData,
      transports: updatedTransports,
    });
  };

  const addTransportField = () => {
    setFormData({
      ...formData,
      transports: [...formData.transports, { mode: '', duration: '', details: '' }],
    });
  };

  const addEditTransportField = () => {
    setEditFormData({
      ...editFormData,
      transports: [...editFormData.transports, { mode: '', duration: '', details: '' }],
    });
  };

  const removeTransportField = (index: number) => {
    if (formData.transports.length <= 1) return;
    const updatedTransports = formData.transports.filter((_, i) => i !== index);
    setFormData({ ...formData, transports: updatedTransports });
  };

  const removeEditTransportField = (index: number) => {
    if (editFormData.transports.length <= 1) return;
    const updatedTransports = editFormData.transports.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, transports: updatedTransports });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('You must be logged in to create routes');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await routeService.createRoute(formData, user.id, token);
      toast.success('Route created successfully!');
      setShowCreateForm(false);
      setFormData({
        from: '',
        to: '',
        transports: [{ mode: '', duration: '', details: '' }],
      });
      const routesData = user ? await routeService.getRoutes(user.id, token) : [];
      const feedbackData = await routeService.getFeedback(token);
      setRoutes(routesData);
      setFeedback(feedbackData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRouteId(route._id);
    setEditFormData({
      from: route.from,
      to: route.to,
      transports: route.transports.map(t => ({
        mode: t.mode,
        duration: t.duration,
        details: t.details || '',
      })),
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRouteId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await routeService.updateRoute(editingRouteId, editFormData, token);
      toast.success('Route updated successfully!');
      setEditingRouteId(null);
      const routesData = user ? await routeService.getRoutes(user.id, token) : [];
      const feedbackData = await routeService.getFeedback(token);
      setRoutes(routesData);
      setFeedback(feedbackData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update route');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingRouteId(null);
    setEditFormData({
      from: '',
      to: '',
      transports: [{ mode: '', duration: '', details: '' }],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await routeService.deleteRoute(id, token);
      toast.success('Route deleted successfully');
      const routesData = user ? await routeService.getRoutes(user.id, token) : [];
      const feedbackData = await routeService.getFeedback(token);
      setRoutes(routesData);
      setFeedback(feedbackData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete route');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Destination Routes</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-button text-white rounded hover:bg-opacity-90"
          disabled={!!editingRouteId}
        >
          <Plus size={18} />
          {showCreateForm ? 'Cancel' : 'Create New Route'}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Route</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From*</label>
                <select
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select departure city</option>
                  {cities.map((city) => (
                    <option key={`city-from-${city._id}`} value={city.cityName}>
                      {city.cityName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">To*</label>
                <select
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select destination city</option>
                  {cities.map((city) => (
                    <option key={`city-to-${city._id}`} value={city.cityName}>
                      {city.cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Transport Options*</h2>

              {formData.transports.map((transport, index) => (
                <div key={`transport-form-${index}`} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Option {index + 1}</h3>
                    {formData.transports.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTransportField(index)}
                        className="text-red-500 text-sm flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mode*</label>
                      <select
                        name="mode"
                        value={transport.mode}
                        onChange={(e) => handleInputChange(e, index)}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select transport</option>
                        {Object.keys(transportIcons).map((mode) => (
                          <option key={`mode-option-${mode}`} value={mode}>
                            {mode}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Duration*</label>
                      <input
                        type="text"
                        name="duration"
                        value={transport.duration}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="e.g., 3 hours"
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Details</label>
                      <input
                        type="text"
                        name="details"
                        value={transport.details}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="Additional information"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTransportField}
                className="text-blue-500 text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                Add Another Transport Option
              </button>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-primary text-white rounded ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? 'Creating...' : 'Create Route'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showCreateForm && !editingRouteId ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : routes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No routes created yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {routes.map((route) => (
              <div key={`route-${route._id}`} className="bg-white rounded-lg shadow overflow-hidden">
                {editingRouteId === route._id ? (
                  <div className="p-5">
                    <h2 className="text-xl font-semibold mb-4">Edit Route</h2>
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">From*</label>
                          <select
                            value={editFormData.from}
                            onChange={(e) => setEditFormData({ ...editFormData, from: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                          >
                            <option value="">Select departure city</option>
                            {cities.map((city) => (
                              <option key={`edit-city-from-${city._id}`} value={city.cityName}>
                                {city.cityName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">To*</label>
                          <select
                            value={editFormData.to}
                            onChange={(e) => setEditFormData({ ...editFormData, to: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                          >
                            <option value="">Select destination city</option>
                            {cities.map((city) => (
                              <option key={`edit-city-to-${city._id}`} value={city.cityName}>
                                {city.cityName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Transport Options*</h2>

                        {editFormData.transports.map((transport, index) => (
                          <div key={`edit-transport-${route._id}-${index}`} className="border p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Option {index + 1}</h3>
                              {editFormData.transports.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEditTransportField(index)}
                                  className="text-red-500 text-sm flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Mode*</label>
                                <select
                                  name="mode"
                                  value={transport.mode}
                                  onChange={(e) => handleEditInputChange(e, index)}
                                  className="w-full p-2 border rounded"
                                  required
                                >
                                  <option value="">Select transport</option>
                                  {Object.keys(transportIcons).map((mode) => (
                                    <option key={`edit-mode-${mode}`} value={mode}>
                                      {mode}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Duration*</label>
                                <input
                                  type="text"
                                  name="duration"
                                  value={transport.duration}
                                  onChange={(e) => handleEditInputChange(e, index)}
                                  placeholder="e.g., 3 hours"
                                  className="w-full p-2 border rounded"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Details</label>
                                <input
                                  type="text"
                                  name="details"
                                  value={transport.details}
                                  onChange={(e) => handleEditInputChange(e, index)}
                                  placeholder="Additional information"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addEditTransportField}
                          className="text-blue-500 text-sm flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Another Transport Option
                        </button>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 border rounded"
                        >
YAHOO!                        Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className={`px-4 py-2 bg-green-600 text-white rounded ${loading ? 'opacity-70' : ''}`}
                        >
                          {loading ? 'Updating...' : 'Update Route'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold">
                        {route.from} → {route.to}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit route"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(route._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete route"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {route.transports.map((transport) => (
                        <div key={`transport-${transport._id}`} className="border-l-4 border-blue-200 pl-3 py-1">
                          <div className="flex items-center gap-2">
                            {transportIcons[transport.mode as keyof typeof transportIcons]}
                            <span className="font-medium">{transport.mode}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>Duration: {transport.duration}</div>
                            {transport.details && (
                              <div className="mt-1">Details: {transport.details}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-xs text-gray-400">
                      Created: {new Date(route.createdAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {feedback.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Feedback for Your Routes</h2>
              <div className="space-y-4">
                {feedback.map((fb) => (
                  <div key={fb._id} className="p-4 bg-white rounded-lg shadow">
                    <p className="font-semibold">
                      Route: {fb.routeId?.from} → {fb.routeId?.to || "Unknown Route"}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="mr-2">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= fb.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-gray-600">({fb.rating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Date: {new Date(fb.submittedAt).toLocaleDateString()}
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
}