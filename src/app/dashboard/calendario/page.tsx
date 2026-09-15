'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface CitaCalendario {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  medico: string;
  especialidad: string;
  estado: string;
  tipo: string;
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

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarioPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [citas, setCitas] = useState<CitaCalendario[]>([]);
  const [loading, setLoading] = useState(false);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('user');
    if (!usuarioGuardado) {
      router.push('/iniciar-sesion');
      return;
    }
    
    const userParsed = JSON.parse(usuarioGuardado);
    setUsuario(userParsed);

    if (userParsed.paciente?.id) {
      cargarCitas(userParsed.paciente.id, fechaActual.getFullYear(), fechaActual.getMonth());
    }
  }, [router]);

  const cargarCitas = async (pacienteId: string, anio: number, mes: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/citas-calendario?pacienteId=${pacienteId}&anio=${anio}&mes=${mes}`);
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

  const mesAnterior = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    setFechaActual(nuevaFecha);
    if (usuario?.paciente?.id) {
      cargarCitas(usuario.paciente.id, nuevaFecha.getFullYear(), nuevaFecha.getMonth());
    }
  };

  const mesSiguiente = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    setFechaActual(nuevaFecha);
    if (usuario?.paciente?.id) {
      cargarCitas(usuario.paciente.id, nuevaFecha.getFullYear(), nuevaFecha.getMonth());
    }
  };

  const irAHoy = () => {
    const hoy = new Date();
    setFechaActual(hoy);
    if (usuario?.paciente?.id) {
      cargarCitas(usuario.paciente.id, hoy.getFullYear(), hoy.getMonth());
    }
  };

  const obtenerDiasDelMes = () => {
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    const dias: (number | null)[] = [];
    
    // Espacios vacíos antes del primer día
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    
    // Días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(i);
    }
    
    return dias;
  };

  const formatearFecha = (anio: number, mes: number, dia: number) => {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  };

  const getCitasDelDia = (dia: number) => {
    const fechaStr = formatearFecha(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
    return citas.filter(c => c.fecha === fechaStr);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PROGRAMADA': return 'bg-blue-600';
      case 'CONFIRMADA': return 'bg-green-600';
      case 'COMPLETADA': return 'bg-gray-600';
      case 'CANCELADA': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const esHoy = (dia: number) => {
    const hoy = new Date();
    return (
      dia === hoy.getDate() &&
      fechaActual.getMonth() === hoy.getMonth() &&
      fechaActual.getFullYear() === hoy.getFullYear()
    );
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  const dias = obtenerDiasDelMes();
  const citasDelDiaSeleccionado = diaSeleccionado 
    ? getCitasDelDia(parseInt(diaSeleccionado))
    : [];

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
          <h1 className="text-3xl font-bold text-white">Calendario de Citas</h1>
          <p className="text-gray-400 mt-2">
            Visualice sus citas médicas en un calendario mensual.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={mesAnterior}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={irAHoy}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Hoy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={mesSiguiente}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <p className="text-gray-400">Cargando...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Encabezados de días de la semana */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {DIAS_SEMANA.map((dia) => (
                        <div key={dia} className="text-center text-xs font-semibold text-gray-400 py-2">
                          {dia}
                        </div>
                      ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-2">
                      {dias.map((dia, index) => {
                        if (dia === null) {
                          return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const citasDelDia = getCitasDelDia(dia);
                        const tieneCitas = citasDelDia.length > 0;
                        const hoy = esHoy(dia);
                        const seleccionado = diaSeleccionado === String(dia);

                        return (
                          <button
                            key={dia}
                            onClick={() => setDiaSeleccionado(String(dia))}
                            className={`
                              aspect-square rounded-lg border p-2 text-left transition-all
                              ${hoy ? 'border-blue-400 bg-blue-900/20' : 'border-gray-700 bg-gray-900/30'}
                              ${seleccionado ? 'ring-2 ring-blue-400' : ''}
                              ${tieneCitas ? 'hover:bg-gray-700/50' : 'hover:bg-gray-800/50'}
                            `}
                          >
                            <div className={`text-sm font-semibold ${hoy ? 'text-blue-400' : 'text-white'}`}>
                              {dia}
                            </div>
                            {tieneCitas && (
                              <div className="mt-1 space-y-1">
                                {citasDelDia.slice(0, 2).map((cita) => (
                                  <div
                                    key={cita.id}
                                    className={`h-1.5 rounded-full ${getEstadoColor(cita.estado)}`}
                                  />
                                ))}
                                {citasDelDia.length > 2 && (
                                  <div className="text-xs text-gray-400">
                                    +{citasDelDia.length - 2} más
                                  </div>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Leyenda */}
                    <div className="mt-6 flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                        <span className="text-gray-400">Programada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-600" />
                        <span className="text-gray-400">Confirmada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-600" />
                        <span className="text-gray-400">Completada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-600" />
                        <span className="text-gray-400">Cancelada</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel de detalles del día seleccionado */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">
                  {diaSeleccionado 
                    ? `Citas del ${diaSeleccionado} de ${MESES[fechaActual.getMonth()]}`
                    : 'Seleccione un día'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {diaSeleccionado 
                    ? `${citasDelDiaSeleccionado.length} cita(s) encontrada(s)`
                    : 'Haga clic en un día del calendario para ver sus citas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {diaSeleccionado ? (
                  citasDelDiaSeleccionado.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No hay citas programadas para este día.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {citasDelDiaSeleccionado.map((cita) => (
                        <div
                          key={cita.id}
                          className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-semibold">Dr. {cita.medico}</p>
                              <p className="text-sm text-gray-400">{cita.especialidad}</p>
                            </div>
                            <Badge className={getEstadoColor(cita.estado)}>
                              {cita.estado}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300 mt-3">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <span>{cita.horaInicio} - {cita.horaFin}</span>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                              {cita.tipo === 'PRESENCIAL' ? 'Presencial' : 'Teleconsulta'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">
                      Seleccione un día del calendario para ver los detalles de sus citas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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