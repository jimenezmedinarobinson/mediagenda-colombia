'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Stethoscope, LogOut, Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, BarChart3, FileText } from 'lucide-react';

interface Cita {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  paciente: string;
  telefono: string;
  correo: string;
  tipo: string;
  motivo: string;
  estado: string;
  notas?: string;
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
  medico?: {
    id: string;
  };
}

export default function DashboardMedicoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [notas, setNotas] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('user');
    if (!usuarioGuardado) {
      router.push('/iniciar-sesion');
      return;
    }
    
    const userParsed = JSON.parse(usuarioGuardado);
    
    if (userParsed.rol !== 'MEDICO') {
      router.push('/dashboard');
      return;
    }
    
    setUsuario(userParsed);

    if (userParsed.medico?.id) {
      cargarCitas(userParsed.medico.id);
    }
  }, [router]);

  const cargarCitas = async (medicoId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/citas-medico?medicoId=${medicoId}`);
      const data = await response.json();
      if (response.ok) {
        setCitas(data);
      } else {
        alert('Error al cargar las citas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCompletar = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setNotas(cita.notas || '');
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setCitaSeleccionada(null);
    setNotas('');
  };

  const confirmarCompletada = async () => {
    if (!citaSeleccionada) return;

    if (!notas.trim()) {
      alert('Debe escribir las notas de la consulta antes de marcarla como completada.');
      return;
    }

    try {
      const response = await fetch(`/api/citas/${citaSeleccionada.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estado: 'COMPLETADA',
          notas: notas 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cita marcada como completada con notas guardadas.');
        cerrarModal();
        if (usuario?.medico?.id) {
          cargarCitas(usuario.medico.id);
        }
      } else {
        alert(data.message || 'Error al actualizar la cita');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const actualizarEstado = async (citaId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/citas/${citaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Cita ${nuevoEstado.toLowerCase()} exitosamente`);
        if (usuario?.medico?.id) {
          cargarCitas(usuario.medico.id);
        }
      } else {
        alert(data.message || 'Error al actualizar la cita');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PROGRAMADA': return 'bg-blue-600 text-white';
      case 'CONFIRMADA': return 'bg-green-600 text-white';
      case 'COMPLETADA': return 'bg-gray-600 text-white';
      case 'CANCELADA': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <Link href="/dashboard-medico" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">MediAgenda</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              Dr. {usuario.nombre} {usuario.apellido}
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
          <h1 className="text-3xl font-bold text-white">Panel del Médico</h1>
          <p className="text-gray-400 mt-2">Gestione sus citas y pacientes</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardContent className="py-6">
              <p className="text-sm text-gray-400">Total de citas</p>
              <p className="text-2xl font-bold text-white">{citas.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardContent className="py-6">
              <p className="text-sm text-gray-400">Citas programadas</p>
              <p className="text-2xl font-bold text-blue-400">
                {citas.filter(c => c.estado === 'PROGRAMADA').length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardContent className="py-6">
              <p className="text-sm text-gray-400">Citas completadas</p>
              <p className="text-2xl font-bold text-green-400">
                {citas.filter(c => c.estado === 'COMPLETADA').length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="pb-2">
              <BarChart3 className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white text-lg">Reportes</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Ver estadísticas y exportar datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard-medico/reportes">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Ver Reportes</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-400">Cargando citas...</p>
          </div>
        ) : citas.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No tiene citas programadas
              </h3>
              <p className="text-gray-400">
                Aún no hay citas agendadas con usted.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {citas.map((cita) => (
              <Card key={cita.id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-400" />
                        {cita.paciente}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {cita.motivo || 'Sin motivo especificado'}
                      </CardDescription>
                    </div>
                    <Badge className={getEstadoColor(cita.estado)}>
                      {cita.estado}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span>{formatearFecha(cita.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span>
                        {cita.horaInicio} - {cita.horaFin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="h-4 w-4 text-blue-400" />
                      <span>{cita.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span>{cita.correo}</span>
                    </div>
                  </div>

                  {cita.notas && (
                    <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Notas de la consulta:
                      </p>
                      <p className="text-white text-sm whitespace-pre-wrap">{cita.notas}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {cita.tipo === 'PRESENCIAL' ? 'Consulta Presencial' : 'Teleconsulta'}
                    </Badge>
                  </div>

                  {cita.estado === 'PROGRAMADA' && (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => actualizarEstado(cita.id, 'CONFIRMADA')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar
                      </Button>
                      <Button
                        onClick={() => abrirModalCompletar(cita)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Marcar Completada
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => actualizarEstado(cita.id, 'CANCELADA')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}

                  {cita.estado === 'CONFIRMADA' && (
                    <Button
                      onClick={() => abrirModalCompletar(cita)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Marcar Completada
                    </Button>
                  )}

                  {(cita.estado === 'COMPLETADA' || cita.estado === 'CANCELADA') && (
                    <p className="text-sm text-gray-400">
                      Esta cita ya fue {cita.estado.toLowerCase()}.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal para agregar notas */}
      {mostrarModal && citaSeleccionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Notas de la Consulta
              </CardTitle>
              <CardDescription className="text-gray-400">
                Cita con {citaSeleccionada.paciente} el {formatearFecha(citaSeleccionada.fecha)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notas" className="text-gray-300">
                  Diagnóstico, medicamentos recetados y observaciones
                </Label>
                <Textarea
                  id="notas"
                  placeholder="Escriba aquí las notas de la consulta..."
                  className="bg-gray-900 border-gray-600 text-white min-h-[150px]"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cerrarModal}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarCompletada}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Guardar y Completar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© 2026 MediAgenda Colombia</p>
        </div>
      </footer>
    </div>
  );
}