import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Download, Eye, Calendar, Star, Phone, Mail, Trash2 } from 'lucide-react';

interface FeedbackSubmission {
  id: string;
  name: string;
  contact: string;
  date_of_experience: string;
  date_of_submission: string;
  before_image_url: string | null;
  after_image_url: string | null;
  overall_experience: number;
  quality_of_service: string;
  timeliness: string;
  professionalism: string;
  communication_ease: string;
  liked_most: string;
  suggestions: string;
  would_recommend: string;
  permission_to_publish: boolean;
  can_contact_again: boolean;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    overallRating: '',
    canContact: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, searchTerm, filters]);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacks = () => {
    let filtered = feedbacks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(feedback =>
        feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.contact.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (filters.overallRating) {
      filtered = filtered.filter(feedback =>
        feedback.overall_experience === parseInt(filters.overallRating)
      );
    }

    // Contact permission filter
    if (filters.canContact) {
      filtered = filtered.filter(feedback =>
        feedback.can_contact_again === (filters.canContact === 'yes')
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(feedback =>
        feedback.date_of_experience >= filters.dateFrom
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(feedback =>
        feedback.date_of_experience <= filters.dateTo
      );
    }

    setFilteredFeedbacks(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Contact', 'Date of Experience', 'Date of Submission',
      'Overall Experience', 'Quality of Service', 'Timeliness', 'Professionalism',
      'Communication Ease', 'Liked Most', 'Suggestions', 'Would Recommend',
      'Permission to Publish', 'Can Contact Again', 'Before Image URL', 'After Image URL'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredFeedbacks.map(feedback => [
        feedback.name,
        feedback.contact,
        feedback.date_of_experience,
        feedback.date_of_submission,
        feedback.overall_experience,
        feedback.quality_of_service,
        feedback.timeliness,
        feedback.professionalism,
        feedback.communication_ease,
        `"${feedback.liked_most}"`,
        `"${feedback.suggestions}"`,
        `"${feedback.would_recommend}"`,
        feedback.permission_to_publish ? 'Yes' : 'No',
        feedback.can_contact_again ? 'Yes' : 'No',
        feedback.before_image_url ? `"${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/feedback-images/${feedback.before_image_url}"` : '',
        feedback.after_image_url ? `"${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/feedback-images/${feedback.after_image_url}"` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    setDeletingId(feedbackId);
    try {
      const { error } = await supabase
        .from('feedback_submissions')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      // Remove from local state
      setFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId));
      
      // Close modal if the deleted feedback was being viewed
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error deleting feedback. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getServiceRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage and analyze customer feedback</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="xl:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <select
                value={filters.overallRating}
                onChange={(e) => setFilters(prev => ({ ...prev, overallRating: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <select
                value={filters.canContact}
                onChange={(e) => setFilters(prev => ({ ...prev, canContact: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Contact Permission</option>
                <option value="yes">Can Contact</option>
                <option value="no">Cannot Contact</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From Date"
              />
            </div>

            <div>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To Date"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredFeedbacks.length} of {feedbacks.length} entries
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{feedback.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    {feedback.contact.includes('@') ? (
                      <Mail className="w-4 h-4 mr-1" />
                    ) : (
                      <Phone className="w-4 h-4 mr-1" />
                    )}
                    {feedback.contact}
                  </p>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < feedback.overall_experience
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Experience: {feedback.date_of_experience}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Submitted: {feedback.date_of_submission}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-xs">
                  <span className="font-medium">Quality:</span>
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getServiceRatingColor(feedback.quality_of_service)}`}>
                    {feedback.quality_of_service}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="font-medium">Timeliness:</span>
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getServiceRatingColor(feedback.timeliness)}`}>
                    {feedback.timeliness}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className={`px-2 py-1 rounded-full ${feedback.permission_to_publish ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {feedback.permission_to_publish ? 'Can Publish' : 'No Publishing'}
                </span>
                <span className={`px-2 py-1 rounded-full ${feedback.can_contact_again ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {feedback.can_contact_again ? 'Can Contact' : 'No Contact'}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedFeedback(feedback)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
                <button
                  onClick={() => handleDeleteFeedback(feedback.id)}
                  disabled={deletingId === feedback.id}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === feedback.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No feedback entries found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <p><strong>Name:</strong> {selectedFeedback.name}</p>
                  <p><strong>Contact:</strong> {selectedFeedback.contact}</p>
                  <p><strong>Experience Date:</strong> {selectedFeedback.date_of_experience}</p>
                  <p><strong>Submission Date:</strong> {selectedFeedback.date_of_submission}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ratings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-24 text-sm">Overall:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedFeedback.overall_experience
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({selectedFeedback.overall_experience}/5)</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Quality: <span className={`px-2 py-1 rounded-full text-xs ${getServiceRatingColor(selectedFeedback.quality_of_service)}`}>{selectedFeedback.quality_of_service}</span></div>
                      <div>Timeliness: <span className={`px-2 py-1 rounded-full text-xs ${getServiceRatingColor(selectedFeedback.timeliness)}`}>{selectedFeedback.timeliness}</span></div>
                      <div>Professionalism: <span className={`px-2 py-1 rounded-full text-xs ${getServiceRatingColor(selectedFeedback.professionalism)}`}>{selectedFeedback.professionalism}</span></div>
                      <div>Communication: <span className={`px-2 py-1 rounded-full text-xs ${getServiceRatingColor(selectedFeedback.communication_ease)}`}>{selectedFeedback.communication_ease}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What they liked most:</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedFeedback.liked_most}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Suggestions for improvement:</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedFeedback.suggestions || 'No suggestions provided'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Would recommend us:</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedFeedback.would_recommend}</p>
                </div>
              </div>

              {(selectedFeedback.before_image_url || selectedFeedback.after_image_url) && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Images:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFeedback.before_image_url && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Before</h4>
                        <img
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/feedback-images/${selectedFeedback.before_image_url}`}
                          alt="Before"
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                    {selectedFeedback.after_image_url && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">After</h4>
                        <img
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/feedback-images/${selectedFeedback.after_image_url}`}
                          alt="After"
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${selectedFeedback.permission_to_publish ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedFeedback.permission_to_publish ? 'Can Publish Testimonial' : 'No Publishing Permission'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${selectedFeedback.can_contact_again ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedFeedback.can_contact_again ? 'Can Contact Again' : 'No Contact Permission'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleDeleteFeedback(selectedFeedback.id);
                  }}
                  disabled={deletingId === selectedFeedback.id}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === selectedFeedback.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;