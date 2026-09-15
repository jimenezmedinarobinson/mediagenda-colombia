const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const medicos = [
  {
    correo: 'dra.lopez@ejemplo.com',
    nombre: 'María',
    apellido: 'López',
    numeroDocumento: '1111111111',
    telefono: '3001111111',
    numeroLicencia: 'TM-20001',
    especialidad: 'Cardiología',
    tiempoConsulta: 45,
  },
  {
    correo: 'dr.ramirez@ejemplo.com',
    nombre: 'Juan',
    apellido: 'Ramírez',
    numeroDocumento: '2222222222',
    telefono: '3002222222',
    numeroLicencia: 'TM-20002',
    especialidad: 'Pediatría',
    tiempoConsulta: 30,
  },
  {
    correo: 'dra.gomez@ejemplo.com',
    nombre: 'Ana',
    apellido: 'Gómez',
    numeroDocumento: '3333333333',
    telefono: '3003333333',
    numeroLicencia: 'TM-20003',
    especialidad: 'Dermatología',
    tiempoConsulta: 25,
  },
  {
    correo: 'dr.torres@ejemplo.com',
    nombre: 'Luis',
    apellido: 'Torres',
    numeroDocumento: '4444444444',
    telefono: '3004444444',
    numeroLicencia: 'TM-20004',
    especialidad: 'Medicina Interna',
    tiempoConsulta: 40,
  },
];

async function main() {
  const contrasena = await bcrypt.hash('123456', 10);

  for (const medico of medicos) {
    try {
      const usuario = await prisma.usuario.create({
        data: {
          correo: medico.correo,
          contrasena: contrasena,
          tipoDocumento: 'CC',
          numeroDocumento: medico.numeroDocumento,
          nombre: medico.nombre,
          apellido: medico.apellido,
          telefono: medico.telefono,
          rol: 'MEDICO',
          medico: {
            create: {
              numeroLicencia: medico.numeroLicencia,
              especialidad: medico.especialidad,
              tiempoConsulta: medico.tiempoConsulta,
            },
          },
        },
        include: { medico: true },
      });
      console.log(`✅ Creado: Dr. ${medico.nombre} ${medico.apellido} - ${medico.especialidad}`);
    } catch (error) {
      console.error(` Error con ${medico.nombre}:`, error.message);
    }
  }

  console.log('\n🎉 Proceso completado. Médicos creados exitosamente.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());