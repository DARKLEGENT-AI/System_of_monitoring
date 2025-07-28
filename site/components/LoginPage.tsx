
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (login: string, pass: string) => Promise<void>;
  error: string | null;
}

const EyeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeSlashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(login, password);
    setLoading(false);
  };

  return (
    <div className="bg-[#D2E7F6] p-8 sm:p-12 rounded-3xl shadow-lg w-full max-w-md">
      <h1 className="text-4xl font-bold text-center text-[#003B73] mb-8">Вход</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <input
            type="text"
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин*"
            required
            className="w-full px-4 py-3 bg-white border border-[#007BFF] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
          />
        </div>
        <div className="mb-8 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль*"
            required
            className="w-full px-4 py-3 bg-white border border-[#007BFF] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-[#007BFF]"
          >
            {showPassword ? <EyeSlashIcon className="h-6 w-6"/> : <EyeIcon className="h-6 w-6"/>}
          </button>
        </div>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <div className="flex justify-center">
            <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#D4F0A4] text-[#003B73] font-bold py-3 px-10 rounded-lg hover:bg-[#c3e093] transition-colors duration-300 disabled:bg-gray-400"
            >
                {loading ? 'Вход...' : 'войти'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
