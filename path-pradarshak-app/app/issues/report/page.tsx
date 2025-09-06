"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Upload,
  X,
  CheckCircle
} from "lucide-react";

export default function ReportIssuePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    priority: "medium"
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    "Potholes",
    "Broken Street Lights",
    "Garbage Collection",
    "Water Issues",
    "Road Damage",
    "Public Safety",
    "Traffic Issues",
    "Other"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Check if user is authenticated
      if (!user) {
        alert('Please log in to report an issue');
        router.push('/auth/login');
        return;
      }

      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('priority', formData.priority);
      
      // Add image if selected
      if (selectedImage) {
        formDataToSend.append('images', selectedImage);
      }
      
      // Get user's location if available
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          formDataToSend.append('coordinates', JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        } catch (error) {
          console.log('Geolocation not available or denied');
        }
      }
      
      // Get token from localStorage or use the user object
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitSuccess(true);
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            title: "",
            description: "",
            category: "",
            location: "",
            priority: "medium"
          });
          setSelectedImage(null);
          setImagePreview(null);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to submit issue');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      if (error.message.includes('Invalid token') || error.message.includes('Token expired')) {
        alert('Your session has expired. Please log in again.');
        router.push('/auth/login');
      } else {
        alert('Failed to submit issue. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Issue Reported Successfully!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for reporting this issue. Our team will review it and take appropriate action.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn btn-primary"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="btn btn-outline ml-4"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-16"></div>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Help us improve your city
            </h2>
            <p className="text-gray-600">
              Report civic issues like potholes, broken street lights, garbage problems, and more. 
              Your report will be reviewed by municipal staff and tracked until resolution.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the issue"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Provide detailed information about the issue..."
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter the exact location or address"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Moderate impact</option>
                <option value="high">High - Significant impact</option>
                <option value="urgent">Urgent - Safety hazard</option>
              </select>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional but recommended)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload a photo</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Submit Issue Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
