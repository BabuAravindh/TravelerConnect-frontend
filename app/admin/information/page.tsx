'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiService, Language, Country, State, City, Question, Activity } from '@/utils/adminApiservice';

interface Item {
  _id?: string;
  name?: string;
  description?: string;
  city: string;
  cityId: string;
  images?: string[];
  category?: string;
  rating?: number;
  from?: string;
  to?: string;
  transports?: { mode: string; duration: string; details: string }[];
  guideId?: string;
  type: 'attractions' | 'events' | 'adventures' | 'cuisines' | 'travelRoutes';
}

interface LanguageForm {
  languageName: string;
  languageStatus: 'active' | 'inactive';
  order: number;
}

interface QuestionForm {
  questionText: string;
  cityId: string;
  status: 'active' | 'inactive';
  order: number;
}

type TabType = 'languages' | 'countries' | 'states' | 'cities' | 'questions' | 'activities';

export default function LocationsAdmin() {
  const [activeTab, setActiveTab] = useState<TabType>('cities');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<Item[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [languages, setLanguages] = useState<Language[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [cityForm, setCityForm] = useState({
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

  const [languageForm, setLanguageForm] = useState<LanguageForm>({
    languageName: '',
    languageStatus: 'active',
    order: 0,
  });

  const [countryForm, setCountryForm] = useState({
    countryName: '',
    order: 0,
  });

  const [stateForm, setStateForm] = useState({
    stateName: '',
    order: 0,
  });

  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    questionText: '',
    cityId: '',
    status: 'active',
    order: 1,
  });

  const [activityForm, setActivityForm] = useState({
    activityName: '',
    order: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDataForTab = useCallback(async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'languages':
          const langs = await apiService.getLanguages();
          setLanguages(Array.isArray(langs) ? langs : []);
          break;
        case 'countries':
          const countriesData = await apiService.getCountries();
          setCountries(Array.isArray(countriesData) ? countriesData : []);
          break;
        case 'states':
          const statesData = await apiService.getStates();
          setStates(Array.isArray(statesData) ? statesData : []);
          break;
        case 'cities':
          const citiesData = await apiService.getCities();
          setCities(Array.isArray(citiesData) ? citiesData : []);
          break;
        case 'questions':
          const questionsData = await apiService.getQuestions();
          setQuestions(Array.isArray(questionsData) ? questionsData : []);
          const citiesDataQuestions = await apiService.getCities();
          setCities(Array.isArray(citiesDataQuestions) ? citiesDataQuestions : []);
          break;
        case 'activities':
          const activitiesData = await apiService.getActivities();
          setActivities(Array.isArray(activitiesData) ? activitiesData : []);
          break;
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      switch (activeTab) {
        case 'languages':
          setLanguages([]);
          break;
        case 'countries':
          setCountries([]);
          break;
        case 'states':
          setStates([]);
          break;
        case 'cities':
          setCities([]);
          break;
        case 'questions':
          setQuestions([]);
          break;
        case 'activities':
          setActivities([]);
          break;
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDataForTab();
  }, [activeTab, fetchDataForTab]);

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const selectedTypes = Object.keys(cityForm.types).filter(
        (key) => cityForm.types[key as keyof typeof cityForm.types]
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
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate items');
      }

      setPreviewItems(result.items);
      setPreviewId(result.previewId);
      setCityForm({
        cityName: '',
        order: 0,
        types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate items');
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
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm items');
      }

      setPreviewItems([]);
      setPreviewId(null);
      fetchDataForTab();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm items');
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
  };

  const handleSubmitItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.index !== undefined) {
      handleUpdateItem(editingItem.index, editingItem);
      setEditingItem(null);
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'cities':
        return (
          <div>
            <form onSubmit={handleCitySubmit} className="bg-white p-4 rounded shadow mb-6">
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
                  {isLoading ? 'Generating...' : 'Generate Items'}
                </button>
              </div>
            </form>

            {previewItems.length > 0 && (
              <div className="bg-white p-4 rounded shadow mb-6">
                <h3 className="text-lg font-medium mb-4">Preview Generated Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previewItems.map((item, index) => (
                    <div key={index} className="border p-4 rounded">
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
                          <img src={item.images?.[0]} alt={item.name} className="w-full h-48 object-cover mt-2" />
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
                      <label className="block text-sm font-medium mb-1">Image URL</label>
                      <input
                        type="text"
                        value={editingItem.images?.[0] || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, images: [e.target.value] })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
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
          </div>
        );
      default:
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            {/* Existing form code for other tabs */}
          </form>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'languages':
          if (editingId) {
            await apiService.updateLanguage(editingId, languageForm);
          } else {
            await apiService.createLanguage(languageForm);
          }
          break;
        case 'countries':
          if (editingId) {
            await apiService.updateCountry(editingId, countryForm);
          } else {
            await apiService.createCountry(countryForm);
          }
          break;
        case 'states':
          if (editingId) {
            await apiService.updateState(editingId, stateForm);
          } else {
            await apiService.createState(stateForm);
          }
          break;
        case 'cities':
          if (editingId) {
            await apiService.updateCity(editingId, cityForm);
          } else {
            await apiService.createCity(cityForm);
          }
          break;
        case 'questions':
          if (!questionForm.cityId) {
            throw new Error('City is required');
          }
          if (questionForm.order < 1 || questionForm.order > 10) {
            throw new Error('Order must be between 1 and 10');
          }
          if (editingId) {
            await apiService.updateQuestion(editingId, questionForm);
          } else {
            await apiService.createQuestion(questionForm);
          }
          break;
        case 'activities':
          if (editingId) {
            await apiService.updateActivity(editingId, activityForm);
          } else {
            await apiService.createActivity(activityForm);
          }
          break;
      }
      fetchDataForTab();
      setEditingId(null);
      setCityForm({
        cityName: '',
        order: 0,
        types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setLanguageForm({ languageName: '', languageStatus: 'active', order: 0 });
    setCountryForm({ countryName: '', order: 0 });
    setStateForm({ stateName: '', order: 0 });
    setCityForm({
      cityName: '',
      order: 0,
      types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
    });
    setQuestionForm({ questionText: '', cityId: '', status: 'active', order: 1 });
    setActivityForm({ activityName: '', order: 0 });
  };

  const handleEdit = (item: Language | Country | State | City | Question | Activity) => {
    switch (activeTab) {
      case 'languages':
        setLanguageForm({
          languageName: (item as Language).languageName,
          languageStatus: (item as Language).languageStatus,
          order: (item as Language).order,
        });
        break;
      case 'countries':
        setCountryForm({
          countryName: (item as Country).countryName,
          order: (item as Country).order || 0,
        });
        break;
      case 'states':
        setStateForm({
          stateName: (item as State).stateName,
          order: (item as State).order || 0,
        });
        break;
      case 'cities':
        setCityForm({
          cityName: (item as City).cityName,
          order: (item as City).order,
          types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
        });
        break;
      case 'questions':
        setQuestionForm({
          questionText: (item as Question).questionText,
          cityId: typeof (item as Question).cityId === 'string' ? (item as Question).cityId : (item as Question).cityId?._id || '',
          status: (item as Question).status,
          order: (item as Question).order,
        });
        break;
      case 'activities':
        setActivityForm({
          activityName: (item as Activity).activityName,
          order: (item as Activity).order,
        });
        break;
    }
    setEditingId(item._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'languages':
          await apiService.deleteLanguage(id);
          break;
        case 'countries':
          await apiService.deleteCountry(id);
          break;
        case 'states':
          await apiService.deleteState(id);
          break;
        case 'cities':
          await apiService.deleteCity(id);
          break;
        case 'questions':
          await apiService.deleteQuestion(id);
          break;
        case 'activities':
          await apiService.deleteActivity(id);
          break;
      }
      fetchDataForTab();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'cities':
        return (
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
                  {cities.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{item.cityName}</td>
                      <td className="p-2">{item.order}</td>
                      <td className="p-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Location & Activity Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex border-b mb-6">
        {(['languages', 'countries', 'states', 'cities', 'questions', 'activities'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {renderForm()}
      {renderTable()}
    </div>
  );
}