'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, ArrowLeft, Calendar, CheckCircle } from 'lucide-react';

interface Medico {
  id: string;
  nombreCompleto: string;
  especialidad: string;
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

export default function AgendarCitaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(false);
  const [citaAgendada, setCitaAgendada] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    medicoId: '',
    fechaCita: '',
    horaInicio: '08:00',
    horaFin: '08:30',
    tipo: 'PRESENCIAL',
    motivo: '',
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('user');
    if (!usuarioGuardado) {
      router.push('/iniciar-sesion');
      return;
    }
    
    const userParsed = JSON.parse(usuarioGuardado);
    setUsuario(userParsed);

    fetch('/api/medicos')
      .then((res) => res.json())
      .then((data) => setMedicos(data))
      .catch((err) => console.error('Error cargando médicos:', err));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.paciente?.id) {
      alert('No se pudo identificar al paciente. Por favor, inicie sesión de nuevo.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: usuario.paciente.id,
          medicoId: formData.medicoId,
          fechaCita: formData.fechaCita,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          tipo: formData.tipo,
          motivo: formData.motivo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Buscar el nombre del médico seleccionado
        const medicoSeleccionado = medicos.find(m => m.id === formData.medicoId);
        setCitaAgendada({
          medico: medicoSeleccionado?.nombreCompleto || 'Médico',
          especialidad: medicoSeleccionado?.especialidad || '',
          fecha: formData.fechaCita,
          hora: `${formData.horaInicio} - ${formData.horaFin}`,
          tipo: formData.tipo,
        });
      } else {
        alert(data.message || 'Error al agendar la cita');
      }
    } catch (error) {
      alert('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  // Si la cita fue agendada, mostrar mensaje de confirmación
  if (citaAgendada) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">MediAgenda</span>
            </Link>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Cita Agendada con Éxito!</h2>
              <p className="text-gray-400 mb-6">Su cita ha sido programada correctamente.</p>
              
              <div className="w-full bg-gray-900/50 rounded-lg p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Médico:</span>
                  <span className="text-white font-medium">Dr. {citaAgendada.medico}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Especialidad:</span>
                  <span className="text-white">{citaAgendada.especialidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Fecha:</span>
                  <span className="text-white">{citaAgendada.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Hora:</span>
                  <span className="text-white">{citaAgendada.hora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Tipo:</span>
                  <span className="text-white">{citaAgendada.tipo === 'PRESENCIAL' ? 'Presencial' : 'Teleconsulta'}</span>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    Ir al Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/citas" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Ver Mis Citas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
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
          <h1 className="text-3xl font-bold text-white">Agendar Nueva Cita</h1>
          <p className="text-gray-400 mt-2">Complete el formulario para programar su consulta médica.</p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Datos de la Cita
            </CardTitle>
            <CardDescription className="text-gray-400">
              Seleccione el médico, la fecha y el motivo de su consulta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="medicoId" className="text-gray-300">Médico y Especialidad</Label>
                <select
                  id="medicoId"
                  required
                  className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
                  value={formData.medicoId}
                  onChange={(e) => setFormData({ ...formData, medicoId: e.target.value })}
                >
                  <option value="">-- Seleccione un médico --</option>
                  {medicos.map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      Dr. {medico.nombreCompleto} - {medico.especialidad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaCita" className="text-gray-300">Fecha</Label>
                  <Input
                    id="fechaCita"
                    type="date"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.fechaCita}
                    onChange={(e) => setFormData({ ...formData, fechaCita: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaInicio" className="text-gray-300">Hora Inicio</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFin" className="text-gray-300">Hora Fin</Label>
                  <Input
                    id="horaFin"
                    type="time"
                    required
                    className="bg-gray-900 border-gray-600 text-white"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Tipo de Consulta</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo"
                      value="PRESENCIAL"
                      checked={formData.tipo === 'PRESENCIAL'}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Presencial</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo"
                      value="TELECONSULTA"
                      checked={formData.tipo === 'TELECONSULTA'}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Teleconsulta</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo" className="text-gray-300">Motivo de la consulta</Label>
                <Input
                  id="motivo"
                  placeholder="Ej: Control general, dolor de cabeza, etc."
                  className="bg-gray-900 border-gray-600 text-white"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6" 
                disabled={loading || !formData.medicoId || !formData.fechaCita}
              >
                {loading ? 'Agendando...' : 'Confirmar y Agendar Cita'}
              </Button>

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