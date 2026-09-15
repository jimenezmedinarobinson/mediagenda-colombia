'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, ArrowLeft, Calendar, Download, BarChart3, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

interface CitaReporte {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  paciente: string;
  tipo: string;
  motivo: string;
  estado: string;
}

interface Estadisticas {
  totalCitas: number;
  completadas: number;
  canceladas: number;
  programadas: number;
  confirmadas: number;
  tasaCompletacion: string;
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

export default function ReportesMedicoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [citas, setCitas] = useState<CitaReporte[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

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

    // Cargar reportes del mes actual por defecto
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
    
    setFechaInicio(primerDiaMes);
    setFechaFin(ultimoDiaMes);

    if (userParsed.medico?.id) {
      cargarReportes(userParsed.medico.id, primerDiaMes, ultimoDiaMes);
    }
  }, [router]);

  const cargarReportes = async (medicoId: string, inicio: string, fin: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reportes-medico?medicoId=${medicoId}&fechaInicio=${inicio}&fechaFin=${fin}`);
      const data = await response.json();
      if (response.ok) {
        setCitas(data.citas);
        setEstadisticas(data.estadisticas);
      } else {
        alert('Error al cargar los reportes');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    if (usuario?.medico?.id && fechaInicio && fechaFin) {
      cargarReportes(usuario.medico.id, fechaInicio, fechaFin);
    }
  };

  const exportarJSON = () => {
    const dataStr = JSON.stringify({ estadisticas, citas }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `reporte-citas-${fechaInicio}-a-${fechaFin}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportarCSV = () => {
    const headers = ['Fecha', 'Hora Inicio', 'Hora Fin', 'Paciente', 'Tipo', 'Motivo', 'Estado'];
    const rows = citas.map(c => [c.fecha, c.horaInicio, c.horaFin, c.paciente, c.tipo, c.motivo, c.estado]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `reporte-citas-${fechaInicio}-a-${fechaFin}.csv`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
          <span className="text-sm text-gray-300">
            Dr. {usuario.nombre} {usuario.apellido}
          </span>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard-medico" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel del Médico
          </Link>
          <h1 className="text-3xl font-bold text-white">Reportes y Estadísticas</h1>
          <p className="text-gray-400 mt-2">Analice el rendimiento de sus consultas en un rango de fechas.</p>
        </div>

        {/* Filtros de fecha */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 mb-8">
          <CardContent className="py-6">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="text-gray-300">Fecha Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  className="bg-gray-900 border-gray-600 text-white"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin" className="text-gray-300">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  className="bg-gray-900 border-gray-600 text-white"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <Button onClick={handleBuscar} className="bg-blue-600 hover:bg-blue-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Total de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{estadisticas.totalCitas}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">{estadisticas.completadas}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Canceladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">{estadisticas.canceladas}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Tasa de Completación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{estadisticas.tasaCompletacion}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Botones de exportación */}
        {citas.length > 0 && (
          <div className="flex gap-4 mb-6">
            <Button onClick={exportarJSON} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Download className="h-4 w-4 mr-2" />
              Exportar JSON
            </Button>
            <Button onClick={exportarCSV} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        )}

        {/* Tabla de citas */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-400">Cargando reportes...</p>
          </div>
        ) : citas.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay citas en este rango</h3>
              <p className="text-gray-400">Intente cambiar las fechas de búsqueda.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Detalle de Citas</CardTitle>
              <CardDescription className="text-gray-400">
                Listado de {citas.length} citas encontradas en el rango seleccionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Hora</th>
                      <th className="px-4 py-3">Paciente</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Motivo</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map((cita) => (
                      <tr key={cita.id} className="border-b border-gray-700 hover:bg-gray-900/30">
                        <td className="px-4 py-3">{cita.fecha}</td>
                        <td className="px-4 py-3">{cita.horaInicio} - {cita.horaFin}</td>
                        <td className="px-4 py-3 font-medium text-white">{cita.paciente}</td>
                        <td className="px-4 py-3">{cita.tipo}</td>
                        <td className="px-4 py-3">{cita.motivo || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge className={getEstadoColor(cita.estado)}>
                            {cita.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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