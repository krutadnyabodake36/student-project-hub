import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { projectsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../context';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    category: 'Web Development',
    githubLink: '',
    status: 'Open',
    imageFile: null,
    existingImage: null,
  });

  const categories = [
    'Web Development',
    'Mobile App',
    'Machine Learning',
    'IoT',
    'Data Science',
    'Other'
  ];

  useEffect(() => {
    fetchProject();
  }, [id, fetchProject]);

  const fetchProject = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      const response = await projectsAPI.getOne(id);
      const project = response.data.data;

      // Check if user is the owner
      if (user?._id !== project.author?._id) {
        toast.error('You can only edit your own projects');
        navigate('/dashboard');
        return;
      }

      setFormData({
        title: project.title,
        description: project.description,
        techStack: project.techStack?.join(', ') || '',
        category: project.category || 'Web Development',
        githubLink: project.githubLink || '',
        status: project.status || 'Open',
        imageFile: null,
        existingImage: project.image || null,
      });

      if (project.image) {
        const imageUrl = project.image.startsWith('http') 
          ? project.image 
          : `${api.defaults.baseURL.replace(/\/api\/?$/,'')}${project.image}`;
        setImagePreview(imageUrl);
      }
    } catch (err) {
      console.error('Load project error:', err);
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user?._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setFormData({ ...formData, imageFile: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageFile: null, existingImage: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('techStack', formData.techStack);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('githubLink', formData.githubLink);
      formDataToSend.append('status', formData.status);
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      } else if (!formData.existingImage) {
        // User removed the image
        formDataToSend.append('removeImage', 'true');
      }

      await projectsAPI.update(id, formDataToSend);
      toast.success('Project updated successfully! ✅');
      navigate(`/project/${id}`);
    } catch (err) {
      console.error('Fetch project error:', err);
      const message = err.response?.data?.message || 'Failed to update project';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600 mt-2">Update your project details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="IoT Smart Home System"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                placeholder="Describe your project in detail..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} / 1000 characters
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                Tech Stack (comma separated) *
              </label>
              <input
                type="text"
                id="techStack"
                name="techStack"
                required
                value={formData.techStack}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="React, Node.js, MongoDB, Express"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate technologies with commas
              </p>
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
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Project Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* GitHub Link */}
            <div>
              <label htmlFor="githubLink" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository Link
              </label>
              <input
                type="url"
                id="githubLink"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="https://github.com/username/repo"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Project Image
              </label>
              
              {!imagePreview ? (
                <div className="mt-2">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-12 h-12 mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-2 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                    title="Remove image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {formData.imageFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">{formData.imageFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  {formData.existingImage && !formData.imageFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">Current project image</p>
                      <p className="text-xs text-gray-500">Click X to remove, or upload new image to replace</p>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Upload a new image to replace the existing one, or remove it entirely
              </p>
            </div>

            {/* Preview Section */}
            {(formData.title || formData.description) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl font-bold text-gray-900">
                      {formData.title || 'Project Title'}
                    </h4>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      formData.status === 'Open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {formData.description || 'Project description will appear here...'}
                  </p>
                  {formData.techStack && (
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.split(',').map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/project/${id}`)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProject;
