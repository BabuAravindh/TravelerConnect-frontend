'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiService, Language, Country, State, City, Question, Activity } from '@/utils/apiservice';

// Form Interfaces
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
  const [activeTab, setActiveTab] = useState<TabType>('languages');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [languages, setLanguages] = useState<Language[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Form states
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

  const [cityForm, setCityForm] = useState({
    cityName: '',
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

  // Editing states
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
          const citiesDataCities = await apiService.getCities();
          setCities(Array.isArray(citiesDataCities) ? citiesDataCities : []);
          break;
        case 'questions':
          const questionsData = await apiService.getQuestions();
          // Optional: Stricter validation
          // const validQuestions = Array.isArray(questionsData)
          //   ? questionsData.filter((q) => q && q._id && (typeof q.cityId === 'string' || (q.cityId && q.cityId.cityName)))
          //   : [];
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
      resetForms();
      setEditingId(null);
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
    setCityForm({ cityName: '', order: 0 });
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

  const renderForm = () => {
    switch (activeTab) {
      case 'languages':
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? 'Edit Language' : 'Add New Language'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={languageForm.languageName}
                  onChange={(e) => setLanguageForm({ ...languageForm, languageName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={languageForm.languageStatus}
                  onChange={(e) =>
                    setLanguageForm({
                      ...languageForm,
                      languageStatus: e.target.value as 'active' | 'inactive',
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={languageForm.order}
                  onChange={(e) =>
                    setLanguageForm({
                      ...languageForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForms();
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
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        );

      case 'countries':
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? 'Edit Country' : 'Add New Country'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={countryForm.countryName}
                  onChange={(e) => setCountryForm({ ...countryForm, countryName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={countryForm.order}
                  onChange={(e) =>
                    setCountryForm({
                      ...countryForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForms();
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
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        );

      case 'states':
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? 'Edit State' : 'Add New State'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={stateForm.stateName}
                  onChange={(e) => setStateForm({ ...stateForm, stateName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={stateForm.order}
                  onChange={(e) =>
                    setStateForm({
                      ...stateForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForms();
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
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        );

      case 'cities':
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? 'Edit City' : 'Add New City'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
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
                    setCityForm({
                      ...cityForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForms();
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
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        );

      case 'questions':
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? 'Edit Question' : 'Add New Question'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question Text</label>
                <input
                  type="text"
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <select
                  value={questionForm.cityId}
                  onChange={(e) => setQuestionForm({ ...questionForm, cityId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.cityName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={questionForm.status}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order (1-10)</label>
                <input
                  type="number"
                  value={questionForm.order}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="10"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            {cities.length === 0 && (
              <p className="text-red-500 text-sm mb-4">Please add cities before creating questions.</p>
            )}
            <div className="flex justify-end space-x-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForms();
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || cities.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        );

      case 'activities':
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? 'Edit Activity' : 'Add New Activity'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={activityForm.activityName}
                  onChange={(e) => setActivityForm({ ...activityForm, activityName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={activityForm.order}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForms();
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
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'languages':
        return (
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">Languages</h3>
            {isLoading && !languages.length ? (
              <p>Loading languages...</p>
            ) : !Array.isArray(languages) || languages.length === 0 ? (
              <p>No languages available</p>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Order</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{item.languageName}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.languageStatus === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.languageStatus}
                        </span>
                      </td>
                      <td className="p-2">{item.order}</td>
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

      case 'countries':
        return (
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">Countries</h3>
            {isLoading && !countries.length ? (
              <p>Loading countries...</p>
            ) : !Array.isArray(countries) || countries.length === 0 ? (
              <p>No countries available</p>
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
                  {countries.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{item.countryName}</td>
                      <td className="p-2">{item.order || '-'}</td>
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

      case 'states':
        return (
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">States</h3>
            {isLoading && !states.length ? (
              <p>Loading states...</p>
            ) : !Array.isArray(states) || states.length === 0 ? (
              <p>No states available</p>
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
                  {states.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{item.stateName}</td>
                      <td className="p-2">{item.order || '-'}</td>
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

      case 'questions':
        return (
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">Questions</h3>
            {isLoading && !questions.length ? (
              <p>Loading questions...</p>
            ) : !Array.isArray(questions) || questions.length === 0 ? (
              <p>No questions available</p>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Question Text</th>
                    <th className="p-2 text-left">City</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Order</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{item.questionText}</td>
                      <td className="p-2">
                        {item.cityId
                          ? typeof item.cityId === 'string'
                            ? item.cityId
                            : item.cityId.cityName
                          : 'No City'}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2">{item.order}</td>
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

      case 'activities':
        return (
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">Activities</h3>
            {isLoading && !activities.length ? (
              <p>Loading activities...</p>
            ) : !Array.isArray(activities) || activities.length === 0 ? (
              <p>No activities available</p>
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
                  {activities.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{item.activityName}</td>
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