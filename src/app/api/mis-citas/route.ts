import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pacienteId = searchParams.get('pacienteId');

    if (!pacienteId) {
      return NextResponse.json(
        { message: 'Se requiere el ID del paciente' },
        { status: 400 }
      );
    }

    const citas = await prisma.cita.findMany({
      where: {
        pacienteId: pacienteId,
      },
      include: {
        medico: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaCita: 'desc',
      },
    });

    const citasFormateadas = citas.map((cita) => ({
      id: cita.id,
      fecha: cita.fechaCita.toISOString().split('T')[0],
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      medico: `${cita.medico.usuario.nombre} ${cita.medico.usuario.apellido}`,
      especialidad: cita.medico.especialidad,
      tipo: cita.tipo,
      motivo: cita.motivo,
      estado: cita.estado,
      notas: cita.notas,
      creadoEn: cita.creadoEn,
    }));

    return NextResponse.json(citasFormateadas);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}