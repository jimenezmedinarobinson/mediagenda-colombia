import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const medicoId = searchParams.get('medicoId');

    if (!medicoId) {
      return NextResponse.json(
        { message: 'Se requiere el ID del médico' },
        { status: 400 }
      );
    }

    const citas = await prisma.cita.findMany({
      where: {
        medicoId: medicoId,
      },
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                telefono: true,
                correo: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaCita: 'asc',
      },
    });

    const citasFormateadas = citas.map((cita) => ({
      id: cita.id,
      fecha: cita.fechaCita.toISOString().split('T')[0],
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      paciente: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`,
      telefono: cita.paciente.usuario.telefono,
      correo: cita.paciente.usuario.correo,
      tipo: cita.tipo,
      motivo: cita.motivo,
      estado: cita.estado,
    }));

    return NextResponse.json(citasFormateadas);
  } catch (error) {
    console.error('Error al obtener citas del médico:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}