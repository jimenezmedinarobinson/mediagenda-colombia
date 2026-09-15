'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope } from 'lucide-react';

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    fechaNacimiento: '',
    genero: 'OTRO',
    direccion: '',
    ciudad: '',
    departamento: '',
    eps: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Registro exitoso. Ahora puede iniciar sesión.');
        router.push('/iniciar-sesion');
      } else {
        const error = await response.json();
        alert(error.message || 'Error en el registro');
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
        <Card className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Crear Cuenta</CardTitle>
            <CardDescription className="text-gray-400">
              Regístrese como paciente para agendar citas médicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoDocumento" className="text-gray-300">Tipo de Documento</Label>
                  <select
                    id="tipoDocumento"
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
                    value={formData.tipoDocumento}
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PP">Pasaporte</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroDocumento" className="text-gray-300">Número de Documento</Label>
                  <Input
                    id="numeroDocumento"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-gray-300">Nombres</Label>
                  <Input
                    id="nombre"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-gray-300">Apellidos</Label>
                  <Input
                    id="apellido"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-gray-300">Teléfono</Label>
                  <Input
                    id="telefono"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento" className="text-gray-300">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genero" className="text-gray-300">Género</Label>
                  <select
                    id="genero"
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eps" className="text-gray-300">EPS</Label>
                  <Input
                    id="eps"
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.eps}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-gray-300">Dirección</Label>
                <Input
                  id="direccion"
                  required
                  className="bg-gray-900 border-gray-600 text-white"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad" className="text-gray-300">Ciudad</Label>
                  <Input
                    id="ciudad"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento" className="text-gray-300">Departamento</Label>
                  <Input
                    id="departamento"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>

              <p className="text-center text-sm text-gray-400">
                ¿Ya tiene cuenta?{' '}
                <Link href="/iniciar-sesion" className="text-blue-400 hover:underline">
                  Iniciar Sesión
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