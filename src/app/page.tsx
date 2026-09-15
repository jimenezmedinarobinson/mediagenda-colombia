import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bell, Shield, Stethoscope } from "lucide-react";

export default function PaginaPrincipal() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">MediAgenda</span>
          </div>
          <div className="space-x-3">
            <Link href="/iniciar-sesion">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/registrarse">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Gestión de Citas Médicas <span className="text-blue-400">Simple y Eficiente</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Agende, gestione y optimice sus citas médicas sin complicaciones.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/registrarse">
              <Button size="lg" className="text-lg px-8 bg-blue-600 hover:bg-blue-700">
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <Calendar className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Reserva en Línea</CardTitle>
              <CardDescription className="text-gray-400">
                Agende sus citas las 24 horas del día, los 7 días de la semana.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <Bell className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Recordatorios</CardTitle>
              <CardDescription className="text-gray-400">
                Reciba avisos automáticos para que nunca olvide su cita.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Datos Seguros</CardTitle>
              <CardDescription className="text-gray-400">
                Su información está protegida según normas colombianas.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-gray-300">© 2026 MediAgenda Colombia. Todos los derechos reservados.</p>
          <p className="text-gray-500 text-sm">
            Sistema desarrollado con tecnologías modernas y de código abierto.
          </p>
        </div>
      </footer>
    </div>
  );
}