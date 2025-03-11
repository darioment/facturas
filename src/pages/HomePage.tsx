import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Shield, CreditCard, Users, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 py-16 md:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Facturación Electrónica CFDI 4.0
              </h1>
              <p className="mt-6 text-xl text-blue-100">
                Genera, consulta y administra tus comprobantes fiscales digitales de forma rápida, segura y conforme a las últimas disposiciones del SAT.
              </p>
              <div className="mt-10 flex space-x-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                >
                  Comenzar Ahora
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M400 0C620.9 0 800 179.1 800 400C800 620.9 620.9 800 400 800C179.1 800 0 620.9 0 400C0 179.1 179.1 0 400 0Z" fill="white" />
          </svg>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Características Principales
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Todo lo que necesitas para cumplir con tus obligaciones fiscales en un solo lugar.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="p-3 rounded-full bg-blue-100 inline-block">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Generación de CFDI 4.0</h3>
                <p className="mt-2 text-gray-500">
                  Crea facturas electrónicas que cumplen con todos los requisitos del SAT para la versión 4.0 del CFDI.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="p-3 rounded-full bg-green-100 inline-block">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Validación Automática</h3>
                <p className="mt-2 text-gray-500">
                  Verifica que tus comprobantes cumplan con todas las reglas y validaciones requeridas antes de timbrarlos.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="p-3 rounded-full bg-purple-100 inline-block">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Múltiples Formas de Pago</h3>
                <p className="mt-2 text-gray-500">
                  Soporta todas las formas de pago reconocidas por el SAT, incluyendo transferencias, efectivo y pagos diferidos.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="p-3 rounded-full bg-yellow-100 inline-block">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Seguridad Avanzada</h3>
                <p className="mt-2 text-gray-500">
                  Protección de datos con encriptación de extremo a extremo y cumplimiento con las normas de protección de datos.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="p-3 rounded-full bg-red-100 inline-block">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
                <p className="mt-2 text-gray-500">
                  Administra diferentes roles y permisos para tu equipo, con control total sobre quién puede crear o consultar facturas.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="p-3 rounded-full bg-indigo-100 inline-block">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Reportes y Estadísticas</h3>
                <p className="mt-2 text-gray-500">
                  Visualiza el estado de tus facturas, montos totales y estadísticas para una mejor gestión financiera.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">¿Listo para comenzar?</span>
            <span className="block text-blue-200">Regístrate hoy y empieza a facturar.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
              >
                Crear Cuenta
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-blue-700"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Términos y Condiciones</span>
                Términos y Condiciones
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Política de Privacidad</span>
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Contacto</span>
                Contacto
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2025 CFDI App. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
