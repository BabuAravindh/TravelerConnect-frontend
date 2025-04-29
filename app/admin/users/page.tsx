'use client';

import { useState, useEffect, useCallback, JSX } from 'react';
import { Search, Trash, ChevronUp, ChevronDown, Loader2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import type { User, SortConfig, UserRole } from './UserTypes';
import { fetchUsers, deleteUser } from './User.service';

export default function AdminUsersPage(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc',
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 10;

  useEffect(() => {
    const loadUsers = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (error: unknown) {
        console.error('Failed to load users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    void loadUsers();
  }, []);

  const debouncedSearch = useCallback(
    (value: string) => {
      debounce((searchValue: string) => {
        setSearchTerm(searchValue);
        setCurrentPage(1);
      }, 300)(value);
    },
    [setSearchTerm, setCurrentPage]
  );

  const requestSort = (key: keyof User): void => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatPhoneNumber = (phone?: string): string => {
    if (!phone) return 'N/A';
    if (phone.startsWith('+91')) return phone;
    if (phone.startsWith('91') && phone.length > 10) return `+${phone}`;
    if (phone.length === 10) return `+91 ${phone}`;
    return phone;
  };

  const formatDOB = (dob?: string): string => {
    if (!dob) return 'N/A';
    return new Date(dob).toLocaleDateString();
  };

  const exportToCSV = (): void => {
    const headers = ['Name', 'Email', 'Role', 'Phone', 'First Name', 'Last Name', 'DOB'];
    const rows = users.map(user => [
      user.name,
      user.email,
      user.role,
      user.phoneNumber || '',
      user.firstName || '',
      user.lastName || '',
      user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users
    .filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (user.phoneNumber?.toLowerCase().includes(searchLower))
      );
    })
    .filter((user) => roleFilter === 'all' || user.role === roleFilter);

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    return sortConfig.direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDeleteClick = (userId: string): void => {
    setDeletingId(userId);
    toast(
      (t) => (
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex space-x-2">
            <button
              onClick={async () => {
                try {
                  await deleteUser(userId);
                  setUsers(users.filter((user) => user._id !== userId));
                  toast.success('User deleted successfully');
                  toast.dismiss(t.id);
                } finally {
                  setDeletingId(null);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setDeletingId(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const toggleUserSelection = (userId: string): void => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRoleFilterChange = (role: UserRole | 'all'): void => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-button text-white rounded-lg hover:bg-green-700"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium">{selectedUsers.length} user(s) selected</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4 flex flex-wrap space-x-4">
        <div className="flex-1 flex items-center">
          <Search className="text-gray-400 mr-2" size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, phone, or role..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value as UserRole | 'all')}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="guide">Guide</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(paginatedUsers.map((user) => user._id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === 'name' &&
                        (sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} className="ml-1" />
                        ) : (
                          <ChevronDown size={16} className="ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      {sortConfig.key === 'email' &&
                        (sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} className="ml-1" />
                        ) : (
                          <ChevronDown size={16} className="ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('phoneNumber')}
                  >
                    <div className="flex items-center">
                      Phone
                      {sortConfig.key === 'phoneNumber' &&
                        (sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} className="ml-1" />
                        ) : (
                          <ChevronDown size={16} className="ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('dateOfBirth')}
                  >
                    <div className="flex items-center">
                      DOB
                      {sortConfig.key === 'dateOfBirth' &&
                        (sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} className="ml-1" />
                        ) : (
                          <ChevronDown size={16} className="ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('role')}
                  >
                    <div className="flex items-center">
                      Role
                      {sortConfig.key === 'role' &&
                        (sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} className="ml-1" />
                        ) : (
                          <ChevronDown size={16} className="ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {formatPhoneNumber(user.phoneNumber)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {formatDOB(user.dateOfBirth)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'guide'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(user._id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          disabled={deletingId === user._id}
                        >
                          {deletingId === user._id ? (
                            <Loader2 className="animate-spin mr-1" size={16} />
                          ) : null}
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {sortedUsers.length > itemsPerPage && (
              <div className="flex justify-between items-center p-4 border-t">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {currentPage} of {Math.ceil(sortedUsers.length / itemsPerPage)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(Math.ceil(sortedUsers.length / itemsPerPage), p + 1)
                    )
                  }
                  disabled={currentPage >= Math.ceil(sortedUsers.length / itemsPerPage)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}