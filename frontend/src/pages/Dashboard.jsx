import React, { useState, useEffect } from 'react';
import { linksApi } from '../api/client';
import CopyButton from '../components/CopyButton';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ url: '', code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await linksApi.getAll();
      setLinks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch links');
      console.error('Error fetching links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      setError('Invalid URL format');
      return;
    }

    // Validate custom code if provided
    if (formData.code.trim()) {
      const codeRegex = /^[A-Za-z0-9]{6,8}$/;
      if (!codeRegex.test(formData.code)) {
        setError('Code must be 6-8 characters long and contain only letters and numbers');
        return;
      }
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = { url: formData.url };
      if (formData.code.trim()) {
        payload.code = formData.code.trim();
      }

      await linksApi.create(payload);
      setSuccess('Link created successfully!');
      setFormData({ url: '', code: '' });
      await fetchLinks();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Code already exists');
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || 'Invalid input');
      } else {
        setError('Failed to create link');
      }
      console.error('Error creating link:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      await linksApi.delete(code);
      setSuccess('Link deleted successfully!');
      await fetchLinks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete link');
      console.error('Error deleting link:', err);
    }
  };

  const truncateUrl = (url, maxLength = 50) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getBaseUrl = () => {
    return `${window.location.protocol}//${window.location.host}`;
  };

  const getShortUrl = (code) => {
    return `${getBaseUrl()}/${code}`;
  };

  // Filter and sort links
  const filteredAndSortedLinks = links
    .filter(link => 
      link.code.toLowerCase().includes(filterText.toLowerCase()) ||
      link.url.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'last_clicked_at') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Create and manage your short links</p>
      </div>

      {/* Add Link Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Link</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL *
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={submitting}
              required
            />
          </div>
          
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Custom Code (optional)
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="abc123 (6-8 characters)"
              pattern="[A-Za-z0-9]{6,8}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={submitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty to auto-generate. Must be 6-8 characters (letters and numbers only).
            </p>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Creating...</span>
              </div>
            ) : (
              'Create Link'
            )}
          </button>
        </form>
      </div>

      {/* Links Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">Your Links</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filter */}
              <input
                type="text"
                placeholder="Filter by code or URL..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="code-asc">Code A-Z</option>
                <option value="code-desc">Code Z-A</option>
                <option value="total_clicks-desc">Most Clicks</option>
                <option value="total_clicks-asc">Least Clicks</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8">
              <LoadingSpinner />
              <p className="text-center text-gray-500 mt-2">Loading links...</p>
            </div>
          ) : filteredAndSortedLinks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {filterText ? 'No links match your filter.' : 'No links created yet.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Clicked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/code/${link.code}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {link.code}
                        </a>
                        <CopyButton text={getShortUrl(link.code)} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900" title={link.url}>
                        {truncateUrl(link.url)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {link.total_clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {link.last_clicked_at ? formatDate(link.last_clicked_at) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <a
                        href={`/code/${link.code}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Stats
                      </a>
                      <button
                        onClick={() => handleDelete(link.code)}
                        className="text-red-600 hover:text-red-800"
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
    </div>
  );
};

export default Dashboard;