export async function onRequestPost(context) {
  try {
    let data;
    const bodyText = await context.request.text();

    // Intenta parsear JSON o decodificar en caso de venir doblemente serializado
    try {
      data = JSON.parse(bodyText);
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
    } catch (e) {
      data = {};
    }

    const apiKey = context.env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'La variable RESEND_API_KEY no está configurada en Cloudflare.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'yakangust@gmail.com',
        subject: `Nuevo mensaje de ${data.nombre || 'Contacto'}`,
        html: `
          <h3>Nuevo mensaje recibido desde el sitio web</h3>
          <p><strong>Nombre:</strong> ${data.nombre || 'N/A'}</p>
          <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${data.mensaje || 'Sin mensaje'}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      return new Response(
        JSON.stringify({ error: 'Error al enviar email mediante Resend', detail: errorData }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Mensaje enviado correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', detail: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
