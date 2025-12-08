import { Link } from 'react-router-dom';
import { useAuth } from '../context';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Student <span className="text-primary-500">Hub</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 text-gray-700 font-medium hover:text-primary-500 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Connect, Collaborate & Create
            <span className="block text-primary-500 mt-2">Amazing Projects Together</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate platform for students to showcase their projects, find teammates, 
            and collaborate on innovative ideas. Join thousands of students building the future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded-lg hover:bg-primary-600 transition shadow-lg hover:shadow-xl"
            >
              Get Started Free 🚀
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white text-primary-500 text-lg font-semibold rounded-lg hover:bg-gray-50 transition shadow-lg border-2 border-primary-500"
            >
              Explore Projects
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">1000+</div>
            <div className="text-gray-600 font-medium">Active Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">500+</div>
            <div className="text-gray-600 font-medium">Projects Shared</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">50+</div>
            <div className="text-gray-600 font-medium">Universities</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Students Love Us
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to showcase and collaborate on projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Showcase Projects
              </h3>
              <p className="text-gray-600">
                Display your amazing work to the world. Share your code, demos, and ideas with fellow students and potential collaborators.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8">
              <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Find Teammates
              </h3>
              <p className="text-gray-600">
                Connect with students who share your interests. Find the perfect team members for your next big project or hackathon.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8">
              <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Collaborate & Learn
              </h3>
              <p className="text-gray-600">
                Get feedback, share knowledge, and grow together. Comment on projects, ask questions, and build something amazing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Project Categories
            </h2>
            <p className="text-xl text-gray-600">
              Explore projects across different domains
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Data Science', 'Other'].map((category) => (
              <div
                key={category}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition cursor-pointer"
              >
                <div className="text-3xl mb-2">
                  {category === 'Web Development' && '💻'}
                  {category === 'Mobile App' && '📱'}
                  {category === 'Machine Learning' && '🧠'}
                  {category === 'IoT' && '🔌'}
                  {category === 'Data Science' && '📊'}
                  {category === 'Other' && '🎯'}
                </div>
                <p className="font-semibold text-gray-900">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join our community of passionate student developers today!
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition shadow-xl"
          >
            Sign Up - It's Free! ✨
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Student Project Hub</h3>
            <p className="text-gray-400 mb-4">
              Empowering students to build amazing projects together
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Student Hub. Made with ❤️ by students, for students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
