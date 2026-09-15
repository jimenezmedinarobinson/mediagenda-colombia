'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, ArrowLeft, User, Save } from 'lucide-react';

interface Paciente {
  id: string;
  usuarioId: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  eps: string | null;
  usuario: {
    nombre: string;
    apellido: string;
    correo: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
  };
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
  paciente?: {
    id: string;
  };
}

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    telefono: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    eps: '',
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('user');
    if (!usuarioGuardado) {
      router.push('/iniciar-sesion');
      return;
    }
    
    const userParsed = JSON.parse(usuarioGuardado);
    setUsuario(userParsed);

    if (userParsed.paciente?.id) {
      cargarPerfil(userParsed.paciente.id);
    }
  }, [router]);

  const cargarPerfil = async (pacienteId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/perfil?pacienteId=${pacienteId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPaciente(data);
        // CORRECCIÓN: Acceder correctamente al teléfono desde usuario.telefono
        setFormData({
          telefono: data.usuario?.telefono || '',
          direccion: data.direccion || '',
          ciudad: data.ciudad || '',
          departamento: data.departamento || '',
          eps: data.eps || '',
        });
      } else {
        alert('Error al cargar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.paciente?.id) return;

    setGuardando(true);
    try {
      const response = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: usuario.paciente.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Perfil actualizado exitosamente');
        // Recargar los datos para verificar
        await cargarPerfil(usuario.paciente.id);
      } else {
        alert(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  if (!usuario || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">MediAgenda</span>
          </Link>
          <span className="text-sm text-gray-300">
            Hola, {usuario.nombre} {usuario.apellido}
          </span>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel de Control
          </Link>
          <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
          <p className="text-gray-400 mt-2">
            Actualice su información personal y de contacto.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Información básica (solo lectura) */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                Información Personal
              </CardTitle>
              <CardDescription className="text-gray-400">
                Estos datos no se pueden modificar desde aquí.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Nombre completo</p>
                <p className="text-white font-medium">{usuario.nombre} {usuario.apellido}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Correo electrónico</p>
                <p className="text-white font-medium">{paciente?.usuario?.correo || 'Cargando...'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Documento</p>
                <p className="text-white font-medium">
                  {paciente?.usuario?.tipoDocumento} {paciente?.usuario?.numeroDocumento}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de edición */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Save className="h-5 w-5 text-blue-400" />
                Información de Contacto
              </CardTitle>
              <CardDescription className="text-gray-400">
                Modifique sus datos de contacto y ubicación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="direccion" className="text-gray-300">Dirección</Label>
                  <Input
                    id="direccion"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="eps" className="text-gray-300">EPS</Label>
                  <Input
                    id="eps"
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.eps}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© 2026 MediAgenda Colombia</p>
        </div>
      </footer>
    </div>
  );
}