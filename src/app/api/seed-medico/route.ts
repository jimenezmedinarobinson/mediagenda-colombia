import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Encriptar la contraseña '123456'
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Crear el usuario y el perfil de médico al mismo tiempo
    const usuario = await prisma.usuario.create({
      data: {
        correo: 'dr.casa@ejemplo.com',
        contrasena: hashedPassword,
        tipoDocumento: 'CC',
        numeroDocumento: '9876543210',
        nombre: 'Carlos',
        apellido: 'Casas',
        telefono: '3009876543',
        rol: 'MEDICO',
        activo: true,
        medico: {
          create: {
            numeroLicencia: 'TM-12345',
            especialidad: 'Medicina General',
            tiempoConsulta: 30,
            activo: true
          }
        }
      }
    });
    
    return NextResponse.json({ 
      message: '✅ Médico creado exitosamente en la base de datos.', 
      id: usuario.id 
    });
  } catch (error: any) {
    // Si ya existe, lo avisamos en lugar de dar error
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        message: 'ℹ️ El médico ya existe en la base de datos. Puede iniciar sesión.' 
      });
    }
    return NextResponse.json({ message: '❌ Error: ' + error.message }, { status: 500 });
  }
}