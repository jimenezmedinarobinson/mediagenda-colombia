import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      correo,
      contrasena,
      tipoDocumento,
      numeroDocumento,
      nombre,
      apellido,
      telefono,
      fechaNacimiento,
      genero,
      direccion,
      ciudad,
      departamento,
      eps,
    } = body;

    if (!correo || !contrasena || !numeroDocumento || !nombre || !apellido) {
      return NextResponse.json(
        { message: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con ese correo' },
        { status: 400 }
      );
    }

    const documentoExistente = await prisma.usuario.findUnique({
      where: { numeroDocumento },
    });

    if (documentoExistente) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con ese número de documento' },
        { status: 400 }
      );
    }

    const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.usuario.create({
      data: {
        correo,
        contrasena: contrasenaHasheada,
        tipoDocumento,
        numeroDocumento,
        nombre,
        apellido,
        telefono,
        rol: 'PACIENTE',
        paciente: {
          create: {
            fechaNacimiento: new Date(fechaNacimiento),
            genero,
            direccion,
            ciudad,
            departamento,
            eps: eps || null,
          },
        },
      },
      include: {
        paciente: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        usuario: {
          id: usuario.id,
          correo: usuario.correo,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
}