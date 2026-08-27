export const prerender = false;

export async function POST({ request, env }) {
  try {
    const formData = await request.formData();
    const nombre = formData.get('nombre');
    const email = formData.get('email');
    const telefono = formData.get('telefono');
    const asunto = formData.get('asunto');
    const mensaje = formData.get('mensaje');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Contacto Website <onboarding@resend.dev>',
        to: ['yakangust@gmail.com'],
        subject: `Nuevo mensaje de contacto: ${asunto}`,
        html: `
          <h2>Solicitud de Asesoría Administrativa</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Correo:</strong> ${email}</p>
          <p><strong>Teléfono / WhatsApp:</strong> ${telefono || 'No proporcionado'}</p>
          <p><strong>Tipo de Asunto:</strong> ${asunto}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje}</p>
        `,
      }),
    });

    if (res.ok) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/contacto?exito=true' },
      });
    } else {
      throw new Error('Error al enviar el correo con Resend');
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
