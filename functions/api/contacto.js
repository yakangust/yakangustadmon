export async function onRequestPost(context) {
  try {
    let nombre = '';
    let email = '';
    let mensaje = '';

    const contentType = context.request.headers.get('content-type') || '';

    // Si viene como formulario nativo (FormData / urlencoded)
    if (contentType.includes('form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await context.request.formData();
      nombre = formData.get('nombre') || formData.get('name') || '';
      email = formData.get('email') || '';
      mensaje = formData.get('mensaje') || formData.get('message') || '';
    } else {
      // Si viene formateado mediante fetch (JSON)
      const bodyText = await context.request.text();
      try {
        let parsed = JSON.parse(bodyText);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        nombre = parsed.nombre || parsed.name || '';
        email = parsed.email || '';
        mensaje = parsed.mensaje || parsed.message || '';
      } catch (e) {
        // Fallback en caso de error de parseo
      }
    }

    const apiKey = context.env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response('Error: RESEND_API_KEY no configurada en Cloudflare.', { status: 500 });
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
        subject: `Nuevo mensaje de ${nombre || 'Contacto'}`,
        html: `
          <h3>Nuevo mensaje recibido desde el sitio web</h3>
          <p><strong>Nombre:</strong> ${nombre || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje || 'Sin mensaje'}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      return new Response(`Error al enviar correo: ${errorData}`, { status: 500 });
    }

    // Si fue envío nativo de HTML, redirige a la página principal con parámetro de éxito
    if (contentType.includes('form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      return Response.redirect(`${new URL(context.request.url).origin}/contacto?status=success`, 303);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Mensaje enviado correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(`Error interno: ${err.message}`, { status: 500 });
  }
}
