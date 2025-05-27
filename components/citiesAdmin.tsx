'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/utils/adminApiservice';
import { Item, CityProfile, City } from '../types/admin/types';

interface CityForm {
  cityName: string;
  order: number;
  types: {
    attractions: boolean;
    events: boolean;
    adventures: boolean;
    cuisines: boolean;
    travelRoutes: boolean;
  };
}

interface CitiesAdminProps {
  onError: (error: string | null) => void;
}

export default function CitiesAdmin({ onError }: CitiesAdminProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [previewItems, setPreviewItems] = useState<Item[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [noImageMessage, setNoImageMessage] = useState<string | null>(null);
  const [cityProfile, setCityProfile] = useState<CityProfile | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCityProfile, setEditingCityProfile] = useState<CityProfile | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [cityForm, setCityForm] = useState<CityForm>({
    cityName: '',
    order: 0,
    types: {
      attractions: false,
      events: false,
      adventures: false,
      cuisines: false,
      travelRoutes: false,
    },
  });

  const fetchCities = useCallback(async () => {
    setIsLoading(true);
    try {
      const citiesData = await apiService.getCities();
      setCities(Array.isArray(citiesData) ? citiesData : []);
      onError(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An unknown error occurred');
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const selectedTypes = Object.keys(cityForm.types).filter(
        (key: keyof typeof cityForm.types) => cityForm.types[key]
      );
      if (selectedTypes.length === 0) {
        throw new Error('At least one type must be selected');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions/create-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          cityName: cityForm.cityName,
          types: selectedTypes,
          order: cityForm.order,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate items');
      }

      setPreviewItems(result.items);
      setPreviewId(result.previewId);
      setNoImageMessage(result.message || null);

      const cityDetails = result.cityDetails || {};
      setCityProfile({
        city: cityForm.cityName,
        coordinates: {
          latitude: cityDetails.coordinates?.latitude || null,
          longitude: cityDetails.coordinates?.longitude || null,
        },
        capital: cityDetails.capital || '',
        population: cityDetails.population || null,
        historicalImportance: cityDetails.historicalImportance || '',
        politicalContext: {
          MP: { name: cityDetails.politicalContext?.MP || '', constituency: '', party: '' },
          MLA: [{ name: cityDetails.politicalContext?.MLA || '', constituency: '', party: '' }],
        },
        notablePersonalities: (cityDetails.notablePersonalities || []).map((name: string) => ({
          name,
          role: '',
          description: '',
        })),
        popularFor: {
          business: cityDetails.popularFor?.business
            ? [{ name: cityDetails.popularFor.business, description: '' }]
            : [],
          craft: cityDetails.popularFor?.craft
            ? [{ name: cityDetails.popularFor.craft, description: '' }]
            : [],
          events: (cityDetails.popularFor?.events
            ? [{ name: cityDetails.popularFor.events, description: '' }]
            : []
          ).concat(
            result.items
              .filter((item: Item) => item.type === 'events')
              .map((item: Item) => ({
                name: item.name || '',
                description: item.description || '',
              }))
          ),
        },
        imageUrls: cityDetails.imageUrls || [],
        cityMap: cityDetails.cityMap || '',
      });

      setCityForm({
        cityName: '',
        order: 0,
        types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to generate items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions/confirm-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          previewId,
          items: previewItems,
          cityProfile: {
            city: cityProfile?.city,
            coordinates: cityProfile?.coordinates,
            capital: cityProfile?.capital,
            population: cityProfile?.population,
            historicalImportance: cityProfile?.historicalImportance,
            politicalContext: {
              MLA: cityProfile?.politicalContext?.MLA[0]?.name || '',
              MP: cityProfile?.politicalContext?.MP?.name || '',
            },
            notablePersonalities: cityProfile?.notablePersonalities?.map((p) => p.name) || [],
            popularFor: {
              business: cityProfile?.popularFor?.business[0]?.name || '',
              craft: cityProfile?.popularFor?.craft[0]?.name || '',
              events: cityProfile?.popularFor?.events[0]?.name || '',
            },
            imageUrls: cityProfile?.imageUrls,
            cityMap: cityProfile?.cityMap,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm items');
      }

      setPreviewItems([]);
      setPreviewId(null);
      setNoImageMessage(null);
      setCityProfile(null);
      setEditingCityProfile(null);
      fetchCities();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to confirm items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = (index: number, updatedItem: Partial<Item>) => {
    setPreviewItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updatedItem } : item))
    );
  };

  const handleEditItem = (item: Item, index: number) => {
    setEditingItem({ ...item, index });
    setImageFile(null);
  };

  const handleEditCityProfile = () => {
    setEditingCityProfile({ ...cityProfile! });
  };

  const handleSubmitCityProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCityProfile) {
      setCityProfile({ ...editingCityProfile });
      setEditingCityProfile(null);
    }
  };

  const handleAddListItem = (
    field: keyof CityProfile['notablePersonalities'] | keyof CityProfile['popularFor'],
    subfield?: keyof CityProfile['popularFor']
  ) => {
    if (!editingCityProfile) return;
    if (field === 'notablePersonalities') {
      setEditingCityProfile({
        ...editingCityProfile,
        notablePersonalities: [
          ...(editingCityProfile.notablePersonalities || []),
          { name: '', role: '', description: '' },
        ],
      });
    } else if (subfield) {
      setEditingCityProfile({
        ...editingCityProfile,
        popularFor: {
          ...editingCityProfile.popularFor!,
          [subfield]: [...(editingCityProfile.popularFor![subfield] || []), { name: '', description: '' }],
        },
      });
    }
  };

  const handleRemoveListItem = (
    field: keyof CityProfile['notablePersonalities'] | keyof CityProfile['popularFor'],
    index: number,
    subfield?: keyof CityProfile['popularFor']
  ) => {
    if (!editingCityProfile) return;
    if (field === 'notablePersonalities') {
      setEditingCityProfile({
        ...editingCityProfile,
        notablePersonalities: editingCityProfile.notablePersonalities?.filter((_, i) => i !== index),
      });
    } else if (subfield) {
      setEditingCityProfile({
        ...editingCityProfile,
        popularFor: {
          ...editingCityProfile.popularFor!,
          [subfield]: editingCityProfile.popularFor![subfield].filter((_, i) => i !== index),
        },
      });
    }
  };

  const handleCityFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await apiService.updateCity(editingId, { cityName: cityForm.cityName, order: cityForm.order });
      } else {
        await apiService.createCity({ cityName: cityForm.cityName, order: cityForm.order });
      }
      fetchCities();
      setEditingId(null);
      setCityForm({
        cityName: '',
        order: 0,
        types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save city');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCity = (city: City) => {
    setCityForm({
      cityName: city.cityName,
      order: city.order || 0,
      types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
    });
    setEditingId(city._id);
  };

  const handleDeleteCity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this city?')) return;
    setIsLoading(true);
    try {
      await apiService.deleteCity(id);
      fetchCities();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to delete city');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.index !== undefined) {
      let updatedImages = editingItem.images || [];
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions/upload-image`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || 'Failed to upload image');
          }
          updatedImages = [result.secure_url];
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Failed to upload image');
          return;
        }
      }
      handleUpdateItem(editingItem.index, { ...editingItem, images: updatedImages });
      setEditingItem(null);
      setImageFile(null);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleCityFormSubmit} className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-medium mb-4">
          {editingId ? 'Edit City' : 'Add New City'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">City Name</label>
            <input
              type="text"
              value={cityForm.cityName}
              onChange={(e) => setCityForm({ ...cityForm, cityName: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input
              type="number"
              value={cityForm.order}
              onChange={(e) =>
                setCityForm({ ...cityForm, order: parseInt(e.target.value) || 0 })
              }
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Generate</label>
          <div className="flex space-x-4">
            {['attractions', 'events', 'adventures', 'cuisines', 'travelRoutes'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={cityForm.types[type as keyof typeof cityForm.types]}
                  onChange={(e) =>
                    setCityForm({
                      ...cityForm,
                      types: { ...cityForm.types, [type]: e.target.checked },
                    })
                  }
                  className="mr-2"
                />
                {type.charAt(0).toUpperCase() + type.slice(1).replace('travelRoutes', 'Travel Routes')}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setCityForm({
                  cityName: '',
                  order: 0,
                  types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
                });
              }}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Saving...' : editingId ? 'Update City' : 'Add City'}
          </button>
          <button
            type="button"
            onClick={handleCitySubmit}
            disabled={isLoading || !cityForm.cityName || Object.values(cityForm.types).every(v => !v)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
          >
            {isLoading ? 'Generating...' : 'Generate Items'}
          </button>
        </div>
      </form>

      {noImageMessage && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {noImageMessage}
        </div>
      )}

      {cityProfile && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">City Profile: {cityProfile.city}</h3>
            <button
              onClick={handleEditCityProfile}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Coordinates:</strong> {cityProfile.coordinates.latitude && cityProfile.coordinates.longitude 
                ? `${parseFloat(cityProfile.coordinates.latitude).toFixed(4)}°N, ${parseFloat(cityProfile.coordinates.longitude).toFixed(4)}°E`
                : 'Not available'}</p>
              <p><strong>Capital:</strong> {cityProfile.capital || 'Not available'}</p>
              <p><strong>Population:</strong> {cityProfile.population?.toLocaleString() || 'Not available'}</p>
              {cityProfile.cityMap && (
                <p><strong>City Map:</strong> <a href={cityProfile.cityMap} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Map</a></p>
              )}
              {cityProfile.imageUrls?.length > 0 && (
                <div className="mt-2">
                  <p><strong>Images:</strong></p>
                  <div className="flex space-x-2">
                    {cityProfile.imageUrls.map((url, i) => (
                      <img key={i} src={url} alt={`${cityProfile.city} ${i + 1}`} className="w-24 h-24 object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              {cityProfile.historicalImportance && (
                <>
                  <h4 className="font-medium">Historical Importance</h4>
                  <p className="text-sm text-gray-600">{cityProfile.historicalImportance}</p>
                </>
              )}
              {cityProfile.politicalContext && (
                <>
                  <h4 className="font-medium mt-4">Political Context</h4>
                  <p><strong>MP:</strong> {cityProfile.politicalContext.MP.name || 'Not available'}</p>
                  <p><strong>MLA:</strong> {cityProfile.politicalContext.MLA[0]?.name || 'Not available'}</p>
                </>
              )}
            </div>
          </div>
          {cityProfile.notablePersonalities?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium">Notable Personalities</h4>
              {cityProfile.notablePersonalities.map((person, i) => (
                <div key={i} className="mb-2">
                  <p><strong>{person.name}</strong> {person.role && `(${person.role})`}</p>
                  {person.description && <p className="text-sm text-gray-600">{person.description}</p>}
                </div>
              ))}
            </div>
          )}
          {cityProfile.popularFor && (
            <div className="mt-4">
              <h4 className="font-medium">Popular For</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p><strong>Business</strong></p>
                  {cityProfile.popularFor.business.map((item, i) => (
                    <div key={i} className="mb-2">
                      <p><strong>{item.name}</strong></p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p><strong>Craft</strong></p>
                  {cityProfile.popularFor.craft.map((item, i) => (
                    <div key={i} className="mb-2">
                      <p><strong>{item.name}</strong></p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p><strong>Events</strong></p>
                  {cityProfile.popularFor.events.map((item, i) => (
                    <div key={i} className="mb-2">
                      <p><strong>{item.name}</strong></p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {editingCityProfile && (
        <form onSubmit={handleSubmitCityProfileEdit} className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Edit City Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">City Name</label>
              <input
                type="text"
                value={editingCityProfile.city}
                onChange={(e) => setEditingCityProfile({ ...editingCityProfile, city: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capital</label>
              <input
                type="text"
                value={editingCityProfile.capital || ''}
                onChange={(e) => setEditingCityProfile({ ...editingCityProfile, capital: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="text"
                value={editingCityProfile.coordinates.latitude || ''}
                onChange={(e) =>
                  setEditingCityProfile({
                    ...editingCityProfile,
                    coordinates: {
                      ...editingCityProfile.coordinates,
                      latitude: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="text"
                value={editingCityProfile.coordinates.longitude || ''}
                onChange={(e) =>
                  setEditingCityProfile({
                    ...editingCityProfile,
                    coordinates: {
                      ...editingCityProfile.coordinates,
                      longitude: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Population</label>
              <input
                type="number"
                value={editingCityProfile.population || ''}
                onChange={(e) =>
                  setEditingCityProfile({ ...editingCityProfile, population: parseInt(e.target.value) || null })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City Map URL</label>
              <input
                type="text"
                value={editingCityProfile.cityMap || ''}
                onChange={(e) => setEditingCityProfile({ ...editingCityProfile, cityMap: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Historical Importance</label>
            <textarea
              value={editingCityProfile.historicalImportance || ''}
              onChange={(e) => setEditingCityProfile({ ...editingCityProfile, historicalImportance: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Political Context</h4>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">MP Name</label>
              <input
                type="text"
                value={editingCityProfile.politicalContext?.MP.name || ''}
                onChange={(e) =>
                  setEditingCityProfile({
                    ...editingCityProfile,
                    politicalContext: {
                      ...editingCityProfile.politicalContext!,
                      MP: { ...editingCityProfile.politicalContext!.MP, name: e.target.value },
                    },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">MLA Name</label>
              <input
                type="text"
                value={editingCityProfile.politicalContext?.MLA[0]?.name || ''}
                onChange={(e) =>
                  setEditingCityProfile({
                    ...editingCityProfile,
                    politicalContext: {
                      ...editingCityProfile.politicalContext!,
                      MLA: [{ name: e.target.value, constituency: '', party: '' }],
                    },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Notable Personalities</h4>
            {editingCityProfile.notablePersonalities?.map((person, index) => (
              <div key={index} className="mb-2 p-2 border rounded">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={person.name}
                  onChange={(e) =>
                    setEditingCityProfile({
                      ...editingCityProfile,
                      notablePersonalities: editingCityProfile.notablePersonalities!.map((p, i) =>
                        i === index ? { ...p, name: e.target.value } : p
                      ),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm font-medium mb-1 mt-2">Role</label>
                <input
                  type="text"
                  value={person.role || ''}
                  onChange={(e) =>
                    setEditingCityProfile({
                      ...editingCityProfile,
                      notablePersonalities: editingCityProfile.notablePersonalities!.map((p, i) =>
                        i === index ? { ...p, role: e.target.value } : p
                      ),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm font-medium mb-1 mt-2">Description</label>
                <textarea
                  value={person.description || ''}
                  onChange={(e) =>
                    setEditingCityProfile({
                      ...editingCityProfile,
                      notablePersonalities: editingCityProfile.notablePersonalities!.map((p, i) =>
                        i === index ? { ...p, description: e.target.value } : p
                      ),
                    })
                  }
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem('notablePersonalities', index)}
                  className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddListItem('notablePersonalities')}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Personality
            </button>
          </div>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Popular For - Business</h4>
            {editingCityProfile.popularFor?.business.map((item, index) => (
              <div key={index} className="mb-2 p-2 border rounded">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    setEditingCityProfile({
                      ...editingCityProfile,
                      popularFor: {
                        ...editingCityProfile.popularFor!,
                        business: editingCityProfile.popularFor!.business.map((b, i) =>
                          i === index ? { ...b, name: e.target.value } : b
                        ),
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm font-medium mb-1 mt-2">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    setEditingCityProfile({
                      ...editingCityProfile,
                      popularFor: {
                        ...editingCityProfile.popularFor!,
                        business: editingCityProfile.popularFor!.business.map((b, i) =>
                          i === index ? { ...b, description: e.target.value } : b
                        ),
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem('popularFor', index, 'business')}
                  className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddListItem('popularFor', 'business')}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Business
            </button>
          </div>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Popular For - Craft</h4>
            {editingCityProfile.popularFor?.craft.map((item, index) => (
              <div key={index} className="mb-2 p-2 border rounded">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    setEditingCityProfile({
                      ...editingCityProfile,
                      popularFor: {
                        ...editingCityProfile.popularFor!,
                        craft: editingCityProfile.popularFor!.craft.map((c, i) =>
                          i === index ? { ...c, name: e.target.value } : c
                        ),
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm font-medium mb-1 mt-2">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    setEditingCityProfile({
                      ...editingCityProfile,
                      popularFor: {
                        ...editingCityProfile.popularFor!,
                        craft: editingCityProfile.popularFor!.craft.map((c, i) =>
                          i === index ? { ...c, description: e.target.value } : c
                        ),
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem('popularFor', index, 'craft')}
                  className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddListItem('popularFor', 'craft')}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Craft
            </button>
          </div>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Popular For - Events</h4>
            {editingCityProfile.popularFor?.events.map((item, index) => (
              <div key={index} className="mb-2 p-2 border rounded">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    setEditingCityProfile({
                      ...editingCityProfile,
                      popularFor: {
                        ...editingCityProfile.popularFor!,
                        events: editingCityProfile.popularFor!.events.map((ev, i) =>
                          i === index ? { ...ev, name: e.target.value } : ev
                        ),
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm font-medium mb-1 mt-2">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    setEditingCityProfile({
                      KmCityProfile,
                      popularFor: {
                        ...editingCityProfile.popularFor!,
                        events: editingCityProfile.popularFor!.events.map((ev, i) =>
                          i === index ? { ...ev, description: e.target.value } : ev
                        ),
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveListItem('popularFor', index, 'events')}
                  className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddListItem('popularFor', 'events')}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Event
            </button>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditingCityProfile(null)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      )}

      {previewItems.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Preview Generated Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewItems.map((item, index) => (
              <div key={item.tempId || index} className="border p-4 rounded">
                {item.type === 'travelRoutes' ? (
                  <>
                    <h4 className="font-medium">{item.from} to {item.to} (Travel Route)</h4>
                    <p className="text-sm text-gray-600">
                      Transports:
                      <ul className="list-disc pl-5">
                        {item.transports?.map((t, i) => (
                          <li key={i}>
                            {t.mode} ({t.duration}): {t.details}
                          </li>
                        ))}
                      </ul>
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="font-medium">{item.name} ({item.type})</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    {item.imageFound && item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-48 object-cover mt-2" />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center mt-2">
                        <p className="text-red-500">No image available. Please upload manually.</p>
                      </div>
                    )}
                    <p className="text-sm mt-2">Category: {item.category}</p>
                  </>
                )}
                <button
                  onClick={() => handleEditItem(item, index)}
                  className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleConfirmItems}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {isLoading ? 'Confirming...' : 'Confirm and Save'}
            </button>
          </div>
        </div>
      )}

 {editingItem && (
  <form onSubmit={handleSubmitItemEdit} className="bg-white p-4 rounded shadow mb-6">
    <h3 className="text-lg font-medium mb-4">Edit Item</h3>
    {editingItem.type === 'travelRoutes' ? (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="text"
              value={editingItem.from || ''}
              onChange={(e) => setEditingItem({ ...editingItem, from: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="text"
              value={editingItem.to || ''}
              onChange={(e) => setEditingItem({ ...editingItem, to: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Transports</label>
          {editingItem.transports?.map((transport, tIndex) => (
            <div key={tIndex} className="mb-2 p-2 border rounded">
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  value={transport.mode}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      transports: editingItem.transports?.map((t, i) =>
                        i === tIndex ? { ...t, mode: e.target.value } : t
                      ),
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  {['Bus', 'Train', 'Flight', 'Ferry', 'Private Vehicle'].map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input
                  type="text"
                  value={transport.duration}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      transports: editingItem.transports?.map((t, i) =>
                        i === tIndex ? { ...t, duration: e.target.value } : t
                      ),
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Details</label>
                <textarea
                  value={transport.details}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      transports: editingItem.transports?.map((t, i) =>
                        i === tIndex ? { ...t, details: e.target.value } : t
                      ),
                    })
                  }
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    ) : (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={editingItem.name || ''}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={editingItem.category || ''}
              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={editingItem.description || ''}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Image</label>
          {!editingItem.imageFound && (
            <p className="text-red-500 text-sm mb-2">No image available. Please upload an image.</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
          {editingItem.images?.[0] && (
            <img
              src={editingItem.images[0]}
              alt={editingItem.name}
              className="w-full h-48 object-cover mt-2"
            />
          )}
        </div>
      </>
    )}
    <div className="flex justify-end space-x-2">
      <button
        type="button"
        onClick={() => {
          setEditingItem(null);
          setImageFile(null);
        }}
        className="px-4 py-2 border rounded"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? 'Updating...' : 'Update Item'}
      </button>
    </div>
  </form>
)}

<div className="bg-white p-4 rounded shadow overflow-x-auto">
  <h3 className="text-lg font-medium mb-4">Cities</h3>
  {isLoading && !cities.length ? (
    <p>Loading cities...</p>
  ) : !Array.isArray(cities) || cities.length === 0 ? (
    <p>No cities available</p>
  ) : (
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Order</th>
          <th className="p-2 text-left">Created</th>
          <th className="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {cities.map((city) => (
          <tr key={city._id} className="border-t">
            <td className="p-2">{city.cityName}</td>
            <td className="p-2">{city.order || '-'}</td>
            <td className="p-2">{new Date(city.createdAt).toLocaleDateString()}</td>
            <td className="p-2 space-x-2">
              <button
                onClick={() => handleEditCity(city)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCity(city._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

      
      </div>

  );
}