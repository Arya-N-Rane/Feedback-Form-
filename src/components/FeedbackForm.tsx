import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Calendar, User, Phone, Star, CheckCircle } from 'lucide-react';

// Regular expression to validate phone numbers (10 digits with optional formatting)
const phoneRegex = /^[\d\s\-\(\)]{10,}$/;

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    dateOfExperience: '',
    overallExperience: 5,
    qualityOfService: 'Excellent',
    timeliness: 'Excellent',
    professionalism: 'Excellent',
    communicationEase: 'Excellent',
    likedMost: '',
    suggestions: '',
    wouldRecommend: '',
    permissionToPublish: false,
    canContactAgain: false
  });

  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate email format - must be @gmail.com
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!phoneRegex.test(formData.contact.replace(/\s/g, ''))) {
      // If it's not a phone number, validate as email
      if (!emailRegex.test(formData.contact)) {
        newErrors.contact = 'Email must be a valid @gmail.com address';
      }
    } else {
      // If it's a phone number, validate phone format
      const digitsOnly = formData.contact.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        newErrors.contact = 'Phone number must be exactly 10 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'before') {
        setBeforeImage(file);
      } else {
        setAfterImage(file);
      }
    }
  };

  const uploadImage = async (file: File, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('feedback-images')
      .upload(fileName, file);
    
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      let beforeImageUrl = null;
      let afterImageUrl = null;

      // Upload images if they exist
      if (beforeImage) {
        const fileName = `before_${Date.now()}_${beforeImage.name}`;
        beforeImageUrl = await uploadImage(beforeImage, fileName);
      }

      if (afterImage) {
        const fileName = `after_${Date.now()}_${afterImage.name}`;
        afterImageUrl = await uploadImage(afterImage, fileName);
      }

      // Insert feedback data
      const { error } = await supabase
        .from('feedback_submissions')
        .insert([
          {
            name: formData.name,
            contact: formData.contact,
            date_of_experience: formData.dateOfExperience,
            date_of_submission: new Date().toISOString().split('T')[0],
            before_image_url: beforeImageUrl,
            after_image_url: afterImageUrl,
            overall_experience: formData.overallExperience,
            quality_of_service: formData.qualityOfService,
            timeliness: formData.timeliness,
            professionalism: formData.professionalism,
            communication_ease: formData.communicationEase,
            liked_most: formData.likedMost,
            suggestions: formData.suggestions,
            would_recommend: formData.wouldRecommend,
            permission_to_publish: formData.permissionToPublish,
            can_contact_again: formData.canContactAgain
          }
        ]);

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your feedback has been submitted successfully. We appreciate your time and input.</p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: '',
                contact: '',
                dateOfExperience: '',
                overallExperience: 5,
                qualityOfService: 'Excellent',
                timeliness: 'Excellent',
                professionalism: 'Excellent',
                communicationEase: 'Excellent',
                likedMost: '',
                suggestions: '',
                wouldRecommend: '',
                permissionToPublish: false,
                canContactAgain: false
              });
              setBeforeImage(null);
              setAfterImage(null);
              setErrors({});
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Service Feedback Form</h2>
        <p className="text-gray-600 mb-8 text-center">We value your feedback and would love to hear about your experience with our service.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Gmail Address or Phone Number *
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                placeholder="example@gmail.com or 1234567890"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contact ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contact && (
                <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date of Experience *
            </label>
            <input
              type="date"
              name="dateOfExperience"
              value={formData.dateOfExperience}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline w-4 h-4 mr-1" />
                Before Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'before')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline w-4 h-4 mr-1" />
                After Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'after')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Ratings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Overall Experience *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, overallExperience: rating }))}
                    className={`p-2 rounded-full transition-colors ${
                      formData.overallExperience >= rating
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.overallExperience === 5 ? 'Very Satisfied' :
                   formData.overallExperience === 4 ? 'Satisfied' :
                   formData.overallExperience === 3 ? 'Neutral' :
                   formData.overallExperience === 2 ? 'Dissatisfied' : 'Very Dissatisfied'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'qualityOfService', label: 'Quality of Service' },
                { name: 'timeliness', label: 'Timeliness' },
                { name: 'professionalism', label: 'Professionalism' },
                { name: 'communicationEase', label: 'Communication Ease' }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} *
                  </label>
                  <select
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Open-ended Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Feedback</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What did you like the most? *
              </label>
              <textarea
                name="likedMost"
                value={formData.likedMost}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions for improvement?
              </label>
              <textarea
                name="suggestions"
                value={formData.suggestions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you recommend us? Why/Why not? *
              </label>
              <textarea
                name="wouldRecommend"
                value={formData.wouldRecommend}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="permissionToPublish"
                checked={formData.permissionToPublish}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I give permission to publish my feedback as a testimonial
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="canContactAgain"
                checked={formData.canContactAgain}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                You can contact me again for reference or follow-up
              </label>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;