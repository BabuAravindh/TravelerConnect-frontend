
'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/utils/adminApiservice';
import { Language, Country, State, Activity } from '@/types/admin/types';
import CitiesAdmin from '@/components/citiesAdmin'
import QuestionsAdmin from '@/components/questionAdmin';

interface LanguageForm {
  languageName: string;
  languageStatus: 'active' | 'inactive';
  order: number;
}

interface CountryForm {
  countryName: string;
  order: number;
}

interface StateForm {
  stateName: string;
  order: number;
}

interface ActivityForm {
  activityName: string;
  order: number;
}

type TabType = 'languages' | 'countries' | 'states' | 'cities' | 'questions' | 'activities';

export default function LocationsAdmin() {
  const [activeTab, setActiveTab] = useState<TabType>('cities');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [languageForm, setLanguageForm] = useState<LanguageForm>({
    languageName: '',
    languageStatus: 'active',
    order: 0,
  });

  const [countryForm, setCountryForm] = useState<CountryForm>({
    countryName: '',
    order: 0,
  });

  const [stateForm, setStateForm] = useState<StateForm>({
    stateName: '',
    order: 0,
  });

  const [activityForm, setActivityForm] = useState<ActivityForm>({
    activityName: '',
    order: 0,
  });

  const fetchDataForTab = useCallback(async () => {
    if (['cities', 'questions'].includes(activeTab)) return; // Handled by child components
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
            await apiService.updateCountry(editingId, { countryName: countryForm.countryName, order: countryForm.order });
          } else {
            await apiService.createCountry({ countryName: countryForm.countryName, order: countryForm.order });
          }
          break;
        case 'states':
          if (editingId) {
            await apiService.updateState(editingId, { stateName: stateForm.stateName, order: stateForm.order });
          } else {
            await apiService.createState({ stateName: stateForm.stateName, order: stateForm.order });
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
      resetForms();
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
    setActivityForm({ activityName: '', order: 0 });
  };

  const handleEdit = (item: Language | Country | State | Activity) => {
    switch (activeTab) {
      case 'languages':
        setLanguageForm({
          languageName: (item as Language).name,
          languageStatus: (item as Language).languageStatus || 'active',
          order: (item as Language).order || 0,
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
      case 'activities':
        setActivityForm({
          activityName: (item as Activity).name,
          order: (item as Activity).order || 0,
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
      case 'cities':
        return <CitiesAdmin onError={setError} />;
      case 'questions':
        return <QuestionsAdmin onError={setError} />;
      default:
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? `Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </h3>
            {activeTab === 'languages' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language Name</label>
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
                    onChange={(e) => setLanguageForm({ ...languageForm, languageStatus: e.target.value as 'active' | 'inactive' })}
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
                    onChange={(e) => setLanguageForm({ ...languageForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            {activeTab === 'countries' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country Name</label>
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
                    onChange={(e) => setCountryForm({ ...countryForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            {activeTab === 'states' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">State Name</label>
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
                    onChange={(e) => setStateForm({ ...stateForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            {activeTab === 'activities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Activity Name</label>
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
                    onChange={(e) => setActivityForm({ ...activityForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
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
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isLoading ? 'Saving...' : editingId ? `Update ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </button>
            </div>
          </form>
        );
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'cities':
      case 'questions':
        return null; // Handled by child components
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
      default:
        const items = activeTab === 'languages' ? languages : activities;
        return (
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            {isLoading && !items.length ? (
              <p>Loading {activeTab}...</p>
            ) : !Array.isArray(items) || items.length === 0 ? (
              <p>No {activeTab} available</p>
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
                  {items.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{(item as any).name || (item as any).languageName || (item as any).activityName}</td>
                      <td className="p-2">{(item as any).order || '-'}</td>
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
            onClick={() => {
              setActiveTab(tab);
              resetForms();
              setEditingId(null);
            }}
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
