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

    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            correo: true,
            tipoDocumento: true,
            numeroDocumento: true,
            telefono: true,
          },
        },
      },
    });

    if (!paciente) {
      return NextResponse.json(
        { message: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(paciente);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { pacienteId, telefono, direccion, ciudad, departamento, eps } = body;

    if (!pacienteId) {
      return NextResponse.json(
        { message: 'Se requiere el ID del paciente' },
        { status: 400 }
      );
    }

    // Primero obtenemos el usuarioId del paciente
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { usuarioId: true },
    });

    if (!paciente) {
      return NextResponse.json(
        { message: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Actualizamos el teléfono en el modelo Usuario y los demás campos en Paciente
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: paciente.usuarioId },
        data: {
          telefono: telefono,
        },
      }),
      prisma.paciente.update({
        where: { id: pacienteId },
        data: {
          direccion: direccion,
          ciudad: ciudad,
          departamento: departamento,
          eps: eps || null,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
}