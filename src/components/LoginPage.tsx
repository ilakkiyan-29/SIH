import { useState } from "react";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Username: only alphabets and spaces
    const usernameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;
    // Password: exactly 13 digits
    const passwordRegex = /^\d{13}$/;

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    if (!usernameRegex.test(username)) {
      setError("Username must be a series of alphabets separated by spaces.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must be vaild");
      return;
    }
    setError("");
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
  <div className="mx-auto" style={{ width: '350px', height: '400px' }}>
        <form
          className="p-6 bg-white rounded-lg shadow-md flex flex-col space-y-6 border border-gray-200"
          onSubmit={handleSubmit}
        >
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">Login</h2>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 bg-blue-700 font-bold rounded-lg shadow-lg hover:bg-blue-800 transition-all text-base mt-2 border border-blue-700"
          style={{ color: '#000', backgroundColor: '#fff', border: '1px solid #000' }}
        >
          Sign In
        </button>
        </form>
      </div>
    </div>
  );
}
