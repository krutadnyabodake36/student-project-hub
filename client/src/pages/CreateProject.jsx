import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    category: 'Web Development',
    githubLink: '',
    imageFile: null,
  });

  const categories = [
    'Web Development',
    'Mobile App',
    'Machine Learning',
    'IoT',
    'Data Science',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setFormData({ ...formData, imageFile: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageFile: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('techStack', formData.techStack);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('githubLink', formData.githubLink);

      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      await projectsAPI.create(formDataToSend);
      toast.success('Project created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-3xl shadow-2xl p-8 border-2 border-white/20">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2">Create New Project</h1>
            <p className="text-white/80 text-lg">Share your project with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-white mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                placeholder="IoT Smart Home System"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-white mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all resize-none font-medium"
                placeholder="Describe your project in detail..."
              />
              <p className="text-xs text-white/60 mt-2 font-medium">
                {formData.description.length} / 1000 characters
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <label htmlFor="techStack" className="block text-sm font-bold text-white mb-2">
                Tech Stack (comma separated) *
              </label>
              <input
                type="text"
                id="techStack"
                name="techStack"
                required
                value={formData.techStack}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                placeholder="React, Node.js, MongoDB, Express"
              />
              <p className="text-xs text-white/60 mt-2 font-medium">
                Separate technologies with commas
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-white mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-purple-900">{cat}</option>
                ))}
              </select>
            </div>

            {/* GitHub Link */}
            <div>
              <label htmlFor="githubLink" className="block text-sm font-bold text-white mb-2">
                GitHub Repository Link
              </label>
              <input
                type="url"
                id="githubLink"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                placeholder="https://github.com/username/repo"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-bold text-white mb-2">
                Project Image (Optional)
              </label>

              {!imagePreview ? (
                <div className="mt-2">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-white/30 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-12 h-12 mb-4 text-white/60"
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
                      <p className="mb-2 text-sm text-white/80 font-bold">
                        <span className="font-black">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-white/60">PNG, JPG, GIF up to 5MB</p>
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
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
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
                  <div className="mt-2 text-sm text-white/80">
                    <p className="font-bold">{formData.imageFile?.name}</p>
                    <p className="text-xs text-white/60">
                      {(formData.imageFile?.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-white/60 mt-2">
                Upload a screenshot or image of your project (Max 5MB)
              </p>
            </div>

            {/* Preview Section */}
            {(formData.title || formData.description) && (
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-black text-white mb-4">Preview</h3>
                <div className="glass-dark rounded-xl p-6 border border-white/20">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h4 className="text-xl font-black text-white mb-2">
                    {formData.title || 'Project Title'}
                  </h4>
                  <p className="text-sm text-white/80 mb-3 line-clamp-3">
                    {formData.description || 'Project description will appear here...'}
                  </p>
                  {formData.techStack && (
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.split(',').map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-bold bg-white/10 text-white rounded-full border border-white/30"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-4 glass text-white font-black rounded-xl hover:bg-white/30 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="relative flex-1 px-6 py-4 text-lg font-black text-purple-900 rounded-xl overflow-hidden group shadow-2xl disabled:opacity-50 transform hover:scale-105 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                <span className="relative">
                  {loading ? 'Creating...' : 'Create Project'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
