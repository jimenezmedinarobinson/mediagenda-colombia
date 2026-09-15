'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, LogOut, Stethoscope, Bell, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Usuario {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  rol: string;
  paciente?: {
    id: string;
  };
}

interface CitaReciente {
  id: string;
  fecha: string;
  horaInicio: string;
  medico: string;
  estado: string;
  actualizadoEn: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [citasRecientes, setCitasRecientes] = useState<CitaReciente[]>([]);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('user');
    if (usuarioGuardado) {
      const userParsed = JSON.parse(usuarioGuardado);
      setUsuario(userParsed);
      
      if (userParsed.paciente?.id) {
        cargarCitasRecientes(userParsed.paciente.id);
      }
    } else {
      router.push('/iniciar-sesion');
    }
  }, [router]);

  const cargarCitasRecientes = async (pacienteId: string) => {
    try {
      const response = await fetch(`/api/mis-citas?pacienteId=${pacienteId}`);
      const data = await response.json();
      if (response.ok) {
        const recientes = data
          .filter((c: any) => c.estado !== 'PROGRAMADA')
          .slice(0, 3);
        setCitasRecientes(recientes);
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const getEstadoIcono = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'CANCELADA': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'COMPLETADA': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA': return 'confirmada por el médico';
      case 'CANCELADA': return 'cancelada';
      case 'COMPLETADA': return 'completada';
      default: return estado;
    }
  };

  if (!usuario) {
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              Hola, {usuario.nombre} {usuario.apellido}
            </span>
            <Button variant="outline" onClick={cerrarSesion} className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Panel de Control</h1>
          <p className="text-gray-400 mt-2">Bienvenido a su panel de gestión de citas médicas</p>
        </div>

        {/* Sección de Notificaciones */}
        {citasRecientes.length > 0 && (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-400" />
                Notificaciones Recientes
              </CardTitle>
              <CardDescription className="text-gray-400">
                Actualizaciones sobre sus citas médicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {citasRecientes.map((cita) => (
                  <div key={cita.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    {getEstadoIcono(cita.estado)}
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        Su cita con <span className="font-semibold">Dr. {cita.medico}</span> el{' '}
                        <span className="font-semibold">{cita.fecha}</span> a las{' '}
                        <span className="font-semibold">{cita.horaInicio}</span> ha sido{' '}
                        <span className="font-semibold">{getEstadoTexto(cita.estado)}</span>.
                      </p>
                    </div>
                    <Badge className={
                      cita.estado === 'CONFIRMADA' ? 'bg-green-600 text-white' :
                      cita.estado === 'CANCELADA' ? 'bg-red-600 text-white' :
                      'bg-blue-600 text-white'
                    }>
                      {cita.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <Calendar className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Mis Citas</CardTitle>
              <CardDescription className="text-gray-400">Ver y gestionar sus citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/citas">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Ver Citas</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <Stethoscope className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Agendar Cita</CardTitle>
              <CardDescription className="text-gray-400">Programar una nueva cita médica</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/agendar">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Agendar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <Calendar className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Calendario</CardTitle>
              <CardDescription className="text-gray-400">Ver citas en calendario mensual</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/calendario">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Ver Calendario</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <User className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Mi Perfil</CardTitle>
              <CardDescription className="text-gray-400">Ver y editar su información personal</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/perfil">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Ver Perfil</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Nombre completo</p>
                <p className="font-medium text-white">{usuario.nombre} {usuario.apellido}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Correo electrónico</p>
                <p className="font-medium text-white">{usuario.correo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Rol</p>
                <p className="font-medium text-white">{usuario.rol}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">ID de usuario</p>
                <p className="font-medium text-xs text-gray-500">{usuario.id}</p>
              </div>
            </div>
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