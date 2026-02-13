import React from 'react';
import { Car } from 'lucide-react';

const LoginPage = ({ username, setUsername, password, setPassword, handleLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2djhoOFYxNmgtOHpNMTYgMzZ2OGg4di04aC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl">
            <Car size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Smart Traffic
          </h1>
          <p className="text-xl text-gray-300 font-light">Vehicle Density-Based Signal System</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Welcome Back</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Enter your password"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            Demo: Use any username and password
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;