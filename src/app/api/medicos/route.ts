import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscamos todos los médicos que estén activos
    const medicos = await prisma.medico.findMany({
      where: {
        activo: true,
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Formateamos la respuesta para que sea fácil de usar en el formulario
    const medicosFormateados = medicos.map((medico) => ({
      id: medico.id,
      nombreCompleto: `${medico.usuario.nombre} ${medico.usuario.apellido}`,
      especialidad: medico.especialidad,
    }));

    return NextResponse.json(medicosFormateados);
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}