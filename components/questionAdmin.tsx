
'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/utils/adminApiservice';
import { Question, City } from '../types/admin/types';

interface QuestionForm {
  questionText: string;
  cityId: string;
  status: 'active' | 'inactive';
  order: number;
  type: 'specific' | 'common';
  options: string;
}

interface QuestionsAdminProps {
  onError: (error: string | null) => void;
}

export default function QuestionsAdmin({ onError }: QuestionsAdminProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    questionText: '',
    cityId: '',
    status: 'active',
    order: 1,
    type: 'specific',
    options: '',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const questionsData = await apiService.getQuestions();
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      const citiesData = await apiService.getCities();
      setCities(Array.isArray(citiesData) ? citiesData : []);
      onError(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An unknown error occurred');
      setQuestions([]);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (questionForm.type === 'specific' && !questionForm.cityId) {
        throw new Error('City is required for specific questions');
      }
      if (questionForm.type === 'common' && questionForm.cityId) {
        throw new Error('City must not be selected for common questions');
      }
      if (questionForm.order < 1 || questionForm.order > 10) {
        throw new Error('Order must be between 1 and 10');
      }
      const questionData = {
        questionText: questionForm.questionText,
        cityId: questionForm.type === 'specific' ? questionForm.cityId : null,
        status: questionForm.status,
        order: questionForm.order,
        type: questionForm.type,
        options: questionForm.type === 'common' ? questionForm.options.split(',').map(opt => opt.trim()).filter(opt => opt) : [],
      };
      if (editingId) {
        await apiService.updateQuestion(editingId, questionData);
      } else {
        await apiService.createQuestion(questionData);
      }
      fetchData();
      setEditingId(null);
      setQuestionForm({ questionText: '', cityId: '', status: 'active', order: 1, type: 'specific', options: '' });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setQuestionForm({
      questionText: question.questionText,
      cityId: typeof question.cityId === 'string' ? question.cityId : question.cityId?._id || '',
      status: question.status,
      order: question.order,
      type: question.type,
      options: question.options ? question.options.join(', ') : '',
    });
    setEditingId(question._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setIsLoading(true);
    try {
      await apiService.deleteQuestion(id);
      fetchData();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to delete question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
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
            <label className="block text-sm font-medium mb-1">City {questionForm.type === 'specific' ? '(Required)' : '(Optional)'}</label>
            <select
              value={questionForm.cityId}
              onChange={(e) => setQuestionForm({ ...questionForm, cityId: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={questionForm.type === 'common'}
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
              onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as 'specific' | 'common', cityId: e.target.value === 'common' ? '' : questionForm.cityId, options: '' })}
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
                setQuestionForm({ questionText: '', cityId: '', status: 'active', order: 1, type: 'specific', options: '' });
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
                  <td className="p-2">{typeof item.cityId === 'string' ? item.cityId : item.cityId?.cityName || 'None'}</td>
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
    </div>
  );
}
