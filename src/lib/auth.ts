import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'clave-secreta-super-segura-para-mediagenda-2026';

export interface UsuarioPayload {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export function generarToken(usuario: UsuarioPayload): string {
  return jwt.sign(usuario, JWT_SECRET, { expiresIn: '7d' });
}

export function verificarToken(token: string): UsuarioPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UsuarioPayload;
    return payload;
  } catch (error) {
    return null;
  }
}