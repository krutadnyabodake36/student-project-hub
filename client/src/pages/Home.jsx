import { Link } from 'react-router-dom';
import { useAuth } from '../context';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Showcase Projects',
      description: 'Display your amazing work to the world. Share your code, demos, and ideas with fellow students and potential collaborators.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Find Teammates',
      description: 'Connect with students who share your interests. Find the perfect team members for your next big project or hackathon.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Collaborate & Learn',
      description: 'Get feedback, share knowledge, and grow together. Comment on projects, ask questions, and build something amazing.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const categories = [
    { name: 'Web Development', icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>) },
    { name: 'Mobile App', icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>) },
    { name: 'Machine Learning', icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>) },
    { name: 'IoT', icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>) },
    { name: 'Data Science', icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>) },
    { name: 'Other', icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>) }
  ];

  return (
    <div className="min-h-screen animated-gradient">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-black text-white">
                Student<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">Hub</span>
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 bg-white text-purple-600 font-black rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-white font-bold hover:bg-white/20 rounded-xl transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="relative px-8 py-3 text-sm font-black text-white rounded-xl overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                    <span className="relative">Sign Up Free</span>
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
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            Connect, Collaborate & Create
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mt-2">
              Amazing Projects Together
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">
            The ultimate platform for students to showcase their projects, find teammates,
            and collaborate on innovative ideas. Join thousands of students building the future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="relative px-10 py-5 text-lg font-black text-purple-900 bg-white rounded-2xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
            >
              <span className="relative">Get Started Free</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-10 py-5 text-lg font-black text-white glass-dark rounded-2xl hover:bg-white/30 transition-all border-2 border-white/30"
            >
              Explore Projects
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            { value: '1000+', label: 'Active Students' },
            { value: '500+', label: 'Projects Shared' },
            { value: '50+', label: 'Universities' }
          ].map((stat, idx) => (
            <div key={idx} className="glass rounded-2xl shadow-xl p-8 text-center card-hover">
              <div className="text-5xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-white/80 font-bold text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              Why Students Love Us
            </h2>
            <p className="text-xl text-white/80 font-medium">
              Everything you need to showcase and collaborate on projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="glass rounded-2xl p-8 card-hover border border-white/20">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/80 font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-white mb-4">
              Project Categories
            </h2>
            <p className="text-xl text-white/80 font-medium">
              Explore projects across different domains
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="glass rounded-xl p-6 text-center hover:shadow-2xl transition cursor-pointer card-hover border border-white/20"
              >
                <div className="text-white mb-3 flex justify-center">
                  {category.icon}
                </div>
                <p className="font-black text-white text-sm">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-3xl p-12 border-2 border-white/20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-white/90 mb-8 font-medium">
              Join our community of passionate student developers today!
            </p>
            <Link
              to="/register"
              className="inline-block relative px-12 py-5 text-lg font-black text-purple-900 bg-white rounded-2xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
            >
              <span className="relative">Sign Up - It's Free!</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-dark border-t border-white/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-black text-white mb-2">Student Project Hub</h3>
            <p className="text-white/70 mb-4 font-medium">
              Empowering students to build amazing projects together
            </p>
            <p className="text-white/50 text-sm">
              © 2025 Student Hub. Made by students, for students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
