import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pacienteId, medicoId, fechaCita, horaInicio, horaFin, tipo, motivo } = body;

    if (!pacienteId || !medicoId || !fechaCita || !horaInicio || !horaFin) {
      return NextResponse.json(
        { message: 'Faltan datos obligatorios para agendar la cita' },
        { status: 400 }
      );
    }

    // Convertir la fecha a un objeto Date para la consulta
    const fechaInicio = new Date(fechaCita);
    const fechaFin = new Date(fechaCita);
    
    // Ajustar para que busque en el mismo día (inicio y fin del día)
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(23, 59, 59, 999);

    // Buscar citas existentes del médico en esa fecha que no estén canceladas
    const citasExistentes = await prisma.cita.findMany({
      where: {
        medicoId: medicoId,
        fechaCita: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: {
          not: 'CANCELADA',
        },
      },
    });

    // Validar superposición de horarios
    const hayConflicto = citasExistentes.some((cita) => {
      return (
        horaInicio < cita.horaFin &&
        horaFin > cita.horaInicio
      );
    });

    if (hayConflicto) {
      return NextResponse.json(
        { message: 'El médico ya tiene una cita agendada en ese horario. Por favor, elija otra hora.' },
        { status: 409 }
      );
    }

    // Verificamos que el paciente exista
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    if (!paciente) {
      return NextResponse.json(
        { message: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Creamos la cita en la base de datos
    const nuevaCita = await prisma.cita.create({
      data: {
        pacienteId,
        medicoId,
        fechaCita: new Date(fechaCita),
        horaInicio,
        horaFin,
        tipo: tipo || 'PRESENCIAL',
        motivo: motivo || 'Consulta general',
        estado: 'PROGRAMADA',
      },
    });

    return NextResponse.json(
      { 
        message: 'Cita agendada exitosamente', 
        cita: nuevaCita 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al agendar cita:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al agendar la cita' },
      { status: 500 }
    );
  }
}