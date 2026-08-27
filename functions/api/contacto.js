export async function onRequestPost(context) {
  try {
    let nombre = '';
    let email = '';
    let servicio = '';
    let mensaje = '';

    const contentType = context.request.headers.get('content-type') || '';

    if (contentType.includes('form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await context.request.formData();
      nombre = formData.get('nombre') || formData.get('name') || '';
      email = formData.get('email') || '';
      servicio = formData.get('servicio') || formData.get('asunto') || '';
      mensaje = formData.get('mensaje') || formData.get('message') || '';
    } else {
      const bodyText = await context.request.text();
      try {
        let parsed = JSON.parse(bodyText);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        nombre = parsed.nombre || parsed.name || '';
        email = parsed.email || '';
        servicio = parsed.servicio || parsed.asunto || '';
        mensaje = parsed.mensaje || parsed.message || '';
      } catch (e) {}
    }

    const apiKey = context.env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response('Error: RESEND_API_KEY no configurada.', { status: 500 });
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
        subject: `Nuevo mensaje de ${nombre || 'Contacto'} - ${servicio || 'Consulta General'}`,
        html: `
          <h3>Nuevo mensaje recibido desde el sitio web</h3>
          <p><strong>Nombre:</strong> ${nombre || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Servicio / Asunto:</strong> ${servicio || 'No especificado'}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje || 'Sin mensaje'}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      return new Response(`Error al enviar correo: ${errorData}`, { status: 500 });
    }

    // Redirección explícita a /contacto/?envio=ok
    if (contentType.includes('form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const origin = new URL(context.request.url).origin;
      return Response.redirect(`${origin}/contacto/?https://yakangustadmon.pages.dev/contacto/`, 303);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Mensaje enviado correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(`Error interno: ${err.message}`, { status: 500 });
  }
}
