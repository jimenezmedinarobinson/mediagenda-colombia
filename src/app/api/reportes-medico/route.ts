import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const medicoId = searchParams.get('medicoId');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    if (!medicoId) {
      return NextResponse.json(
        { message: 'Se requiere el ID del médico' },
        { status: 400 }
      );
    }

    const where: any = {
      medicoId: medicoId,
    };

    if (fechaInicio && fechaFin) {
      where.fechaCita = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    const citas = await prisma.cita.findMany({
      where,
      include: {
        paciente: {
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
        fechaCita: 'asc',
      },
    });

    // Calcular estadísticas
    const totalCitas = citas.length;
    const completadas = citas.filter(c => c.estado === 'COMPLETADA').length;
    const canceladas = citas.filter(c => c.estado === 'CANCELADA').length;
    const programadas = citas.filter(c => c.estado === 'PROGRAMADA').length;
    const confirmadas = citas.filter(c => c.estado === 'CONFIRMADA').length;

    const citasFormateadas = citas.map((cita) => ({
      id: cita.id,
      fecha: cita.fechaCita.toISOString().split('T')[0],
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      paciente: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`,
      tipo: cita.tipo,
      motivo: cita.motivo,
      estado: cita.estado,
    }));

    return NextResponse.json({
      estadisticas: {
        totalCitas,
        completadas,
        canceladas,
        programadas,
        confirmadas,
        tasaCompletacion: totalCitas > 0 ? ((completadas / totalCitas) * 100).toFixed(1) : '0',
      },
      citas: citasFormateadas,
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}