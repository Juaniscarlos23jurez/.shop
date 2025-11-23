"use client";

import React from "react";

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen w-full bg-gray-50 text-gray-900">
      <section id="privacidad" className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="mb-2 text-2xl font-bold">
            🔒 POLÍTICA DE PRIVACIDAD (Usuarios de la App)
          </h1>
          <p className="mb-4 text-sm text-gray-600">
            <strong>Fecha de última actualización:</strong> 23 de octubre de 2025
          </p>

          <p className="mb-4">
            En <strong>Rewin</strong> respetamos tu privacidad. A continuación explicamos
            qué datos recopilamos, con qué finalidad, cómo los protegemos y los
            derechos que te asisten.
          </p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">1. Responsable del tratamiento</h2>
          <p className="mb-4">
            Responsable: <strong>Rewin</strong>
            <br />
            Domicilio: <strong>Av. Paseos del Bosque 100, Col. Lomas del Bosque, C.P. 07710, CDMX</strong>
            <br />
            Correo: <code>soporte@rewin.com</code>
          </p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">2. Datos personales que recopilamos</h2>
          <p>Podemos recopilar y procesar las siguientes categorías de datos:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>
              <strong>Identificación:</strong> nombre, correo electrónico, teléfono.
            </li>
            <li>
              <strong>Cuenta y credenciales:</strong> nombre de usuario, contraseña (hash).
            </li>
            <li>
              <strong>Actividad y uso:</strong> historial de puntos, cupones, transacciones con Comercios afiliados, fechas de canje.
            </li>
            <li>
              <strong>Datos del dispositivo:</strong> modelo de dispositivo, sistema operativo, identificadores técnicos, dirección IP.
            </li>
            <li>
              <strong>Ubicación:</strong> solo si otorgas permiso explícito.
            </li>
            <li>
              <strong>Preferencias de comunicación:</strong> consentimiento para recibir promociones, notificaciones, etc.
            </li>
          </ul>

          <h2 className="mb-2 mt-4 text-xl font-semibold">3. Finalidades del tratamiento</h2>
          <p>Utilizaremos tus datos para:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Crear, mantener y administrar tu cuenta.</li>
            <li>Gestionar la acumulación y canje de puntos y cupones.</li>
            <li>Enviar notificaciones operativas y promocionales según tus preferencias.</li>
            <li>Detectar y prevenir fraudes y usos no autorizados.</li>
            <li>Mejorar y personalizar la experiencia dentro de la App.</li>
          </ul>

          <h2 className="mb-2 mt-4 text-xl font-semibold">4. Base legal</h2>
          <p>El tratamiento se realiza, según corresponda, sobre la base de:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Tu consentimiento.</li>
            <li>La ejecución de un contrato (prestación del servicio de fidelización).</li>
            <li>
              El interés legítimo de la Empresa para ofrecer y optimizar el servicio y prevenir fraudes.
            </li>
          </ul>

          <h2 className="mb-2 mt-4 text-xl font-semibold">5. Compartición de datos</h2>
          <p>Podemos compartir tus datos con:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>
              <strong>Comercios afiliados:</strong> únicamente la información necesaria para gestionar tu participación en su programa (por ejemplo, identificador de usuario y saldo de puntos).
            </li>
            <li>
              <strong>Proveedores de servicios:</strong> servicios de hosting, mensajería, análisis y notificaciones que actúan como encargados del tratamiento bajo contrato.
            </li>
            <li>
              <strong>Autoridades competentes:</strong> cuando sea requerido por ley.
            </li>
          </ul>
          <p className="mb-4">No vendemos tus datos personales a terceros.</p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">6. Transferencias internacionales</h2>
          <p className="mb-4">
            Si se realizan transferencias internacionales de datos (por ejemplo, a proveedores extranjeros), se adoptarán las medidas necesarias para garantizar un nivel de protección adecuado conforme a la ley aplicable.
          </p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">7. Conservación de datos</h2>
          <p className="mb-4">
            Conservamos tus datos mientras tu cuenta esté activa y durante los plazos que exijan obligaciones legales o para la defensa de intereses legítimos. Cuando los datos ya no sean necesarios se eliminarán o anonimizan.
          </p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">8. Derechos del interesado</h2>
          <p className="mb-4">
            Tienes los derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición, así como a no ser objeto de decisiones automatizadas con efectos jurídicos relevantes. Para ejercerlos, contacta a: <code>soporte@rewin.com</code>
          </p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">9. Medidas de seguridad</h2>
          <p className="mb-4">
            Implementamos medidas técnicas y organizativas razonables (cifrado, controles de acceso, políticas internas) para proteger tus datos. Sin embargo, ningún sistema es infalible; en caso de incidente notificaremos a las autoridades y a los Usuarios según la normativa aplicable.
          </p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">10. Cookies y tecnologías similares</h2>
          <p className="mb-4">
            La App y el sitio web pueden usar cookies y tecnologías similares para fines funcionales, analíticos y publicitarios. Puedes gestionar tus preferencias a través de la configuración de la App o del navegador.
          </p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">11. Cambios a la Política</h2>
          <p className="mb-4">
            Podremos actualizar esta Política. Publicaremos la versión actualizada en la App y notificaremos cambios importantes con antelación razonable.
          </p>

          <h2 className="mb-2 mt-4 text-xl font-semibold">12. Contacto</h2>
          <p className="mb-6">
            Si tienes preguntas o deseas ejercer tus derechos, escríbenos a: <code>soporte@rewin.com</code>
          </p>

          <footer className="border-t pt-4 text-xs text-gray-500">
            <p>
              Documento preparado por <strong>Rewin</strong>.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
