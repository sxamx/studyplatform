import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0066CC] dark:bg-[#4D94FF] text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-[#666666] dark:text-[#B0B0B0]">
            Ingresa a tu cuenta para continuar con tu progreso
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-[#DC3545]/10 border border-[#DC3545]/30 text-xs font-semibold text-[#DC3545] dark:text-[#FF6B6B]">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Ingresar a la Plataforma
            </Button>
          </form>
        </Card>

        {/* Register footer link */}
        <p className="text-center text-xs text-[#666666] dark:text-[#B0B0B0]">
          ¿No tienes una cuenta aún?{' '}
          <Link to="/register" className="font-bold text-[#0066CC] dark:text-[#4D94FF] hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
