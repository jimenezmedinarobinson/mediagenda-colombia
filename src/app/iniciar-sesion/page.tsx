'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirigir según el rol
        if (data.user.rol === 'MEDICO') {
          router.push('/dashboard-medico');
        } else {
          router.push('/dashboard');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      alert('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">MediAgenda</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-400">
              Acceda a su cuenta para gestionar sus citas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="correo" className="text-gray-300">Correo Electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  required
                  className="bg-gray-900 border-gray-600 text-white"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contrasena" className="text-gray-300">Contraseña</Label>
                <Input
                  id="contrasena"
                  type="password"
                  required
                  className="bg-gray-900 border-gray-600 text-white"
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
              <p className="text-center text-sm text-gray-400">
                ¿No tiene cuenta?{' '}
                <Link href="/registrarse" className="text-blue-400 hover:underline">
                  Registrarse
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© 2026 MediAgenda Colombia</p>
        </div>
      </footer>
    </div>
  );
}