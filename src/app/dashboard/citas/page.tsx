'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, ArrowLeft, Calendar, Clock, XCircle, CheckCircle, Search, Filter, SortAsc, SortDesc, FileText } from 'lucide-react';

interface Cita {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  medico: string;
  especialidad: string;
  tipo: string;
  motivo: string;
  estado: string;
  notas?: string;
  creadoEn: string;
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

export default function MisCitasPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [busquedaMedico, setBusquedaMedico] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [ordenFecha, setOrdenFecha] = useState('desc');

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('user');
    if (!usuarioGuardado) {
      router.push('/iniciar-sesion');
      return;
    }
    
    const userParsed = JSON.parse(usuarioGuardado);
    setUsuario(userParsed);

    if (userParsed.paciente?.id) {
      cargarCitas(userParsed.paciente.id);
    }
  }, [router]);

  const cargarCitas = async (pacienteId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/mis-citas?pacienteId=${pacienteId}`);
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

  const cancelarCita = async (citaId: string) => {
    if (!confirm('¿Está seguro de que desea cancelar esta cita? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/citas/${citaId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cita cancelada exitosamente');
        if (usuario?.paciente?.id) {
          cargarCitas(usuario.paciente.id);
        }
      } else {
        alert(data.message || 'Error al cancelar la cita');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al cancelar');
    }
  };

  const citasProcesadas = useMemo(() => {
    let resultado = [...citas];

    if (filtroEstado !== 'TODOS') {
      resultado = resultado.filter(c => c.estado === filtroEstado);
    }

    if (busquedaMedico.trim() !== '') {
      resultado = resultado.filter(c =>
        c.medico.toLowerCase().includes(busquedaMedico.toLowerCase())
      );
    }

    resultado.sort((a, b) => {
      const fechaHoraA = new Date(`${a.fecha}T${a.horaInicio}`).getTime();
      const fechaHoraB = new Date(`${b.fecha}T${b.horaInicio}`).getTime();
      return ordenFecha === 'asc' ? fechaHoraA - fechaHoraB : fechaHoraB - fechaHoraA;
    });

    return resultado;
  }, [citas, filtroEstado, busquedaMedico, ordenFecha]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PROGRAMADA': return 'bg-blue-600 text-white';
      case 'CONFIRMADA': return 'bg-green-600 text-white';
      case 'COMPLETADA': return 'bg-gray-600 text-white';
      case 'CANCELADA': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'PROGRAMADA': return 'Programada';
      case 'CONFIRMADA': return 'Confirmada';
      case 'COMPLETADA': return 'Completada';
      case 'CANCELADA': return 'Cancelada';
      default: return estado;
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
          <h1 className="text-3xl font-bold text-white">Mis Citas Médicas</h1>
          <p className="text-gray-400 mt-2">
            Busque, filtre y gestione todas sus citas programadas.
          </p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 mb-8">
          <CardContent className="py-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busqueda" className="text-gray-300 flex items-center gap-2">
                  <Search className="h-4 w-4" /> Buscar Médico
                </Label>
                <Input
                  id="busqueda"
                  placeholder="Ej: Carlos, López..."
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
                  value={busquedaMedico}
                  onChange={(e) => setBusquedaMedico(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-gray-300 flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filtrar por Estado
                </Label>
                <select
                  id="estado"
                  className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="PROGRAMADA">Programadas</option>
                  <option value="CONFIRMADA">Confirmadas</option>
                  <option value="COMPLETADA">Completadas</option>
                  <option value="CANCELADA">Canceladas</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orden" className="text-gray-300 flex items-center gap-2">
                  {ordenFecha === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  Ordenar por Fecha
                </Label>
                <select
                  id="orden"
                  className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
                  value={ordenFecha}
                  onChange={(e) => setOrdenFecha(e.target.value)}
                >
                  <option value="desc">Más recientes primero</option>
                  <option value="asc">Más antiguas primero</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
              Mostrando <span className="text-white font-bold">{citasProcesadas.length}</span> de {citas.length} citas
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-400">Cargando citas...</p>
          </div>
        ) : citasProcesadas.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No se encontraron citas
              </h3>
              <p className="text-gray-400 mb-4">
                {citas.length === 0 
                  ? 'Aún no ha agendado ninguna cita médica.' 
                  : 'No hay citas que coincidan con sus filtros de búsqueda.'}
              </p>
              {citas.length === 0 && (
                <Link href="/dashboard/agendar">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Agendar mi primera cita
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {citasProcesadas.map((cita) => (
              <Card key={cita.id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-blue-400" />
                        Dr. {cita.medico}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {cita.especialidad}
                      </CardDescription>
                    </div>
                    <Badge className={getEstadoColor(cita.estado)}>
                      {getEstadoTexto(cita.estado)}
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
                  </div>

                  {cita.motivo && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-1">Motivo de la consulta:</p>
                      <p className="text-white">{cita.motivo}</p>
                    </div>
                  )}

                  {/* Sección de notas del médico (solo visible si la cita está completada) */}
                  {cita.estado === 'COMPLETADA' && cita.notas && (
                    <div className="mb-4 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
                      <p className="text-sm text-blue-300 mb-2 flex items-center gap-1 font-semibold">
                        <FileText className="h-4 w-4" /> Notas del Médico
                      </p>
                      <p className="text-white whitespace-pre-wrap">{cita.notas}</p>
                    </div>
                  )}

                  {cita.estado === 'COMPLETADA' && !cita.notas && (
                    <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400 italic">
                        Esta cita fue completada pero no se registraron notas.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {cita.tipo === 'PRESENCIAL' ? 'Consulta Presencial' : 'Teleconsulta'}
                    </Badge>
                  </div>

                  {cita.estado === 'PROGRAMADA' && (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => cancelarCita(cita.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar Cita
                      </Button>
                    </div>
                  )}

                  {cita.estado === 'CANCELADA' && (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Esta cita fue cancelada</span>
                    </div>
                  )}

                  {cita.estado === 'COMPLETADA' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Consulta completada</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© 2026 MediAgenda Colombia</p>
        </div>
      </footer>
    </div>
  );
}