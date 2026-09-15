import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const citaExistente = await prisma.cita.findUnique({
      where: { id: id },
    });

    if (!citaExistente) {
      return NextResponse.json(
        { message: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    if (citaExistente.estado === 'CANCELADA') {
      return NextResponse.json(
        { message: 'La cita ya está cancelada' },
        { status: 400 }
      );
    }

    const citaCancelada = await prisma.cita.update({
      where: { id: id },
      data: {
        estado: 'CANCELADA',
      },
    });

    return NextResponse.json({
      message: 'Cita cancelada exitosamente',
      cita: citaCancelada,
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, notas } = body;

    if (!estado) {
      return NextResponse.json(
        { message: 'Se requiere el nuevo estado' },
        { status: 400 }
      );
    }

    const estadosValidos = ['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { message: 'Estado no válido' },
        { status: 400 }
      );
    }

    if (estado === 'COMPLETADA' && !notas) {
      return NextResponse.json(
        { message: 'Debe agregar notas de la consulta para marcarla como completada' },
        { status: 400 }
      );
    }

    const datosActualizacion: any = {
      estado: estado,
    };

    if (notas !== undefined) {
      datosActualizacion.notas = notas;
    }

    const citaActualizada = await prisma.cita.update({
      where: { id: id },
      data: datosActualizacion,
    });

    return NextResponse.json({
      message: `Cita actualizada a ${estado}`,
      cita: citaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}