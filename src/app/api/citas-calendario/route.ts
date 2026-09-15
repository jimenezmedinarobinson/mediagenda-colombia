import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pacienteId = searchParams.get('pacienteId');
    const anio = searchParams.get('anio');
    const mes = searchParams.get('mes');

    if (!pacienteId || !anio || !mes) {
      return NextResponse.json(
        { message: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    const anioNum = parseInt(anio);
    const mesNum = parseInt(mes);

    // Calcular el primer y último día del mes
    const primerDia = new Date(anioNum, mesNum, 1);
    const ultimoDia = new Date(anioNum, mesNum + 1, 0);

    const citas = await prisma.cita.findMany({
      where: {
        pacienteId: pacienteId,
        fechaCita: {
          gte: primerDia,
          lte: ultimoDia,
        },
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
        fechaCita: 'asc',
      },
    });

    const citasFormateadas = citas.map((cita) => ({
      id: cita.id,
      fecha: cita.fechaCita.toISOString().split('T')[0],
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      medico: `${cita.medico.usuario.nombre} ${cita.medico.usuario.apellido}`,
      especialidad: cita.medico.especialidad,
      estado: cita.estado,
      tipo: cita.tipo,
    }));

    return NextResponse.json(citasFormateadas);
  } catch (error) {
    console.error('Error al obtener citas del calendario:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}