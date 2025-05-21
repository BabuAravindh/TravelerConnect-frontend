'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiService, Language, Country, State, City, Question, Activity } from '@/utils/adminApiservice';

// Updated Item interface to match backend
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
  imageFound?: boolean;
}

// Updated CityProfile interface to align with backend cityDetails
interface CityProfile {
  city: string;
  coordinates: { latitude: number | null; longitude: number | null };
  country: string | null;
  population: number | null;
  description: string | null;
  // Optional fields for Madurai-specific data (not yet supported by backend)
  capital?: string;
  cityMap?: string;
  topAttractions?: {
    name: string;
    description: string;
    category: string;
    images: string[];
    rating: number;
  }[];
  politicalContext?: {
    MLA: { name: string; constituency: string; party: string }[];
    MP: { name: string; constituency: string; party: string };
  };
  historicalImportance?: string;
  topPersonalities?: { name: string; role: string; description: string }[];
  popularFor?: {
    business: { name: string; description: string }[];
    craft: { name: string; description: string }[];
    events: { name: string; description: string }[];
  };
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
  type: 'specific' | 'common';
  options: string;
}

interface CountryForm {
  countryName: string;
  order: number;
}

interface StateForm {
  stateName: string;
  order: number;
}

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

interface Institution {
  _id?: string;
  name: string;
  description?: string;
  type: 'hospital' | 'school' | 'college' | 'university' | 'research_center';
  address: string;
  contact?: string;
  website?: string;
}

interface ActivityForm {
  activityName: string;
  order: number;
}

type TabType = 'languages' | 'countries' | 'states' | 'cities' | 'questions' | 'activities' | 'institutions';

export default function LocationsAdmin() {
  const [activeTab, setActiveTab] = useState<TabType>('cities');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<Item[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [noImageMessage, setNoImageMessage] = useState<string | null>(null);
  const [cityProfile, setCityProfile] = useState<CityProfile | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [languages, setLanguages] = useState<Language[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

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

  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    questionText: '',
    cityId: '',
    status: 'active',
    order: 1,
    type: 'specific',
    options: '',
  });

  const [activityForm, setActivityForm] = useState<ActivityForm>({
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

      // Set CityProfile based on backend response
      const cityDetails = result.cityDetails || {};
      const baseProfile: CityProfile = {
        city: cityForm.cityName,
        coordinates: {
          latitude: cityDetails.latitude || null,
          longitude: cityDetails.longitude || null,
        },
        country: cityDetails.country || null,
        population: cityDetails.population || null,
        description: cityDetails.description || null,
      };

      if (cityForm.cityName.toLowerCase() === 'madurai') {
        // Mock Madurai-specific data until backend supports it
        setCityProfile({
          ...baseProfile,
          capital: 'Chennai', // Example, as Madurai is not a capital
          cityMap: `https://www.openstreetmap.org/#map=12/${cityDetails.latitude || 9.9252}/${cityDetails.longitude || 78.1198}`,
          topAttractions: result.items
            .filter((item: Item) => item.type === 'attractions')
            .map((item: Item) => ({
              name: item.name || '',
              description: item.description || '',
              category: item.category || '',
              images: item.images || [],
              rating: item.rating || 0,
            })),
          politicalContext: {
            MP: { name: 'Unknown MP', constituency: 'Madurai', party: 'Unknown' }, // Placeholder
            MLA: [
              { name: 'Unknown MLA', constituency: 'Madurai Central', party: 'Unknown' }, // Placeholder
            ],
          },
          historicalImportance: 'Madurai, known as the Temple City, is one of the oldest continuously inhabited cities in the world, with a history dating back over 2,500 years.', // Placeholder
          topPersonalities: [
            { name: 'Unknown', role: 'Unknown', description: 'Placeholder personality.' }, // Placeholder
          ],
          popularFor: {
            business: [{ name: 'Textile Industry', description: 'Madurai is a hub for textile trade.' }], // Placeholder
            craft: [{ name: 'Madurai Sungudi', description: 'Traditional tie-dye sarees.' }], // Placeholder
            events: result.items
              .filter((item: Item) => item.type === 'events')
              .map((item: Item) => ({
                name: item.name || '',
                description: item.description || '',
              })),
          },
        });
      } else {
        setCityProfile(baseProfile);
      }

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
      setNoImageMessage(null);
      setCityProfile(null);
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
    if (cityProfile && updatedItem.type === 'attractions') {
      setCityProfile({
        ...cityProfile,
        topAttractions: cityProfile.topAttractions?.map((attraction, i) =>
          i === index ? { ...attraction, ...updatedItem } : attraction
        ),
      });
    }
  };

  const handleEditItem = (item: Item, index: number) => {
    setEditingItem({ ...item, index });
    setImageFile(null);
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
          setError(err instanceof Error ? err.message : 'Failed to upload image');
          return;
        }
      }
      handleUpdateItem(editingItem.index, { ...editingItem, images: updatedImages });
      setEditingItem(null);
      setImageFile(null);
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
        case 'cities':
          if (editingId) {
            await apiService.updateCity(editingId, { cityName: cityForm.cityName, order: cityForm.order });
          } else {
            await apiService.createCity({ cityName: cityForm.cityName, order: cityForm.order });
          }
          break;
        case 'questions':
          if (!questionForm.cityId) {
            throw new Error('City is required');
          }
          if (questionForm.order < 1 || questionForm.order > 10) {
            throw new Error('Order must be between 1 and 10');
          }
          const questionData = {
            questionText: questionForm.questionText,
            cityId: questionForm.cityId,
            status: questionForm.status,
            order: questionForm.order,
            type: questionForm.type,
            options: questionForm.type === 'common' ? questionForm.options.split(',').map(opt => opt.trim()).filter(opt => opt) : undefined,
          };
          if (editingId) {
            await apiService.updateQuestion(editingId, questionData);
          } else {
            await apiService.createQuestion(questionData);
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
    setCityForm({
      cityName: '',
      order: 0,
      types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
    });
    setQuestionForm({ questionText: '', cityId: '', status: 'active', order: 1, type: 'specific', options: '' });
    setActivityForm({ activityName: '', order: 0 });
  };

  const handleEdit = (item: Language | Country | State | City | Question | Activity) => {
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
      case 'cities':
        setCityForm({
          cityName: (item as City).cityName,
          order: (item as City).order || 0,
          types: { attractions: false, events: false, adventures: false, cuisines: false, travelRoutes: false },
        });
        break;
      case 'questions':
        const question = item as Question;
        setQuestionForm({
          questionText: question.questionText,
          cityId: typeof question.cityId === 'string' ? question.cityId : question.cityId?._id || '',
          status: question.status,
          order: question.order,
          type: question.type,
          options: question.options ? question.options.join(', ') : '',
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

            {error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                {error.includes('travelRoutes') ? (
                  <>
                    <p>Failed to generate enough travel routes. This may be due to limited route options for {cityForm.cityName}.</p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleCitySubmit({ preventDefault: () => {} } as React.FormEvent)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() =>
                          setCityForm({
                            ...cityForm,
                            types: { ...cityForm.types, travelRoutes: false },
                          })
                        }
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Skip Travel Routes
                      </button>
                    </div>
                  </>
                ) : (
                  error
                )}
              </div>
            )}

            {noImageMessage && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                {noImageMessage}
              </div>
            )}

            {cityProfile && (
              <div className="bg-white p-4 rounded shadow mb-6">
                <h3 className="text-lg font-medium mb-4">City Profile: {cityProfile.city}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Coordinates:</strong> {cityProfile.coordinates.latitude && cityProfile.coordinates.longitude 
                      ? `${cityProfile.coordinates.latitude.toFixed(4)}°N, ${cityProfile.coordinates.longitude.toFixed(4)}°E`
                      : 'Not available'}</p>
                    <p><strong>Country:</strong> {cityProfile.country || 'Not available'}</p>
                    <p><strong>Population:</strong> {cityProfile.population || 'Not available'}</p>
                    {cityProfile.cityMap && (
                      <p><strong>City Map:</strong> <a href={cityProfile.cityMap} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Map</a></p>
                    )}
                  </div>
                  <div>
                    {cityProfile.description && (
                      <>
                        <h4 className="font-medium">Description</h4>
                        <p className="text-sm text-gray-600">{cityProfile.description}</p>
                      </>
                    )}
                    {cityProfile.capital && (
                      <p><strong>Capital:</strong> {cityProfile.capital}</p>
                    )}
                    {cityProfile.politicalContext && (
                      <>
                        <h4 className="font-medium">Political Context</h4>
                        <p><strong>MP:</strong> {cityProfile.politicalContext.MP.name} ({cityProfile.politicalContext.MP.party}, {cityProfile.politicalContext.MP.constituency})</p>
                        <p><strong>MLAs:</strong></p>
                        <ul className="list-disc pl-5">
                          {cityProfile.politicalContext.MLA.map((mla, i) => (
                            <li key={i}>{mla.name} ({mla.party}, {mla.constituency})</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
                {cityProfile.historicalImportance && (
                  <div className="mt-4">
                    <h4 className="font-medium">Historical Importance</h4>
                    <p className="text-sm text-gray-600">{cityProfile.historicalImportance}</p>
                  </div>
                )}
                {cityProfile.topPersonalities && (
                  <div className="mt-4">
                    <h4 className="font-medium">Top Personalities</h4>
                    {cityProfile.topPersonalities.map((person, i) => (
                      <div key={i} className="mb-2">
                        <p><strong>{person.name}</strong> ({person.role})</p>
                        <p className="text-sm text-gray-600">{person.description}</p>
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
                          {item.imageFound ? (
                            <img src={item.images?.[0]} alt={item.name} className="w-full h-48 object-cover mt-2" />
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
          </div>
        );

      case 'questions':
        return (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? 'Edit Question' : 'Add New Question'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  onChange={(e) => setQuestionForm({ ...questionForm, status: e.target.value as 'active' | 'inactive' })}
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
                  value={questionForm.order}
                  onChange={(e) => setQuestionForm({ ...questionForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 border rounded"
                  min="1"
                  max="10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={questionForm.type}
                  onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as 'specific' | 'common', options: '' })}
                  className="w-full p-2 border rounded"
                >
                  <option value="specific">Specific</option>
                  <option value="common">Common</option>
                </select>
              </div>
              {questionForm.type === 'common' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Options (comma-separated)</label>
                  <input
                    type="text"
                    value={questionForm.options}
                    onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Option1, Option2, Option3"
                    required
                  />
                </div>
              )}
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
                {isLoading ? 'Saving...' : editingId ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        );
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
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Options</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Order</th>
                    <th className="p-2 text-left">Created</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{item.questionText}</td>
                      <td className="p-2">{typeof item.cityId === 'string' ? item.cityId : item.cityId?.cityName}</td>
                      <td className="p-2">{item.type}</td>
                      <td className="p-2">{item.options ? item.options.join(', ') : '-'}</td>
                      <td className="p-2">{item.status}</td>
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
        return (
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            {isLoading ? (
              <p>Loading {activeTab}...</p>
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
                  {(activeTab === 'languages' ? languages : activeTab === 'activities' ? activities : []).map((item) => (
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
              setPreviewItems([]);
              setPreviewId(null);
              setCityProfile(null);
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
