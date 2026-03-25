import fs from 'fs';
import path from 'path';

// Cargar variables de entorno desde .env.local manualmente para no requerir dependencias extra como dotenv
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.replace(/(^"|"$)/g, '').replace(/\\n/g, '\n');
      } else if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
        value = value.replace(/(^'|'$)/g, '');
      }
      process.env[key] = value;
    }
  });
} else {
  console.error('No se encontró el archivo .env.local. Asegúrate de estar en la raíz del proyecto.');
  process.exit(1);
}

const WP_API_URL = process.env.WP_API_URL || 'https://api.cmcbelleza.shop/wp-json';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
  console.error('Faltan las credenciales WC_CONSUMER_KEY o WC_CONSUMER_SECRET en .env.local');
  process.exit(1);
}

// Configurar autenticación Basic
const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Basic ${auth}`,
};

const pages = [
  {
    slug: 'eliminacion-de-datos',
    title: 'Política de Eliminación de Datos',
    status: 'publish',
    content: `
<h2>Política de Eliminación de Datos</h2>
<p>En cumplimiento con las políticas de Meta (Facebook e Instagram) 
y el Reglamento General de Protección de Datos (RGPD), 
CMC Belleza ofrece a sus usuarios el derecho a solicitar 
la eliminación de sus datos personales.</p>

<h2>¿Qué datos podemos tener sobre ti?</h2>
<p>Si has utilizado el inicio de sesión con Facebook o Instagram 
en nuestra plataforma, podemos tener acceso a:</p>
<ul>
  <li>Nombre y apellidos</li>
  <li>Dirección de correo electrónico</li>
  <li>ID de usuario de Facebook/Instagram</li>
  <li>Foto de perfil pública</li>
</ul>

<h2>Cómo solicitar la eliminación de tus datos</h2>
<p>Tienes tres formas de solicitar la eliminación 
de tus datos personales:</p>

<h3>Opción 1 — Desde Facebook</h3>
<ol>
  <li>Ve a tu cuenta de Facebook</li>
  <li>Accede a Configuración y privacidad → Configuración</li>
  <li>Selecciona Aplicaciones y sitios web</li>
  <li>Busca CMC Belleza y haz clic en Eliminar</li>
  <li>Confirma la eliminación</li>
</ol>

<h3>Opción 2 — Por correo electrónico</h3>
<p>Envía un correo a 
<a href="mailto:soporte@cmcbelleza.shop">soporte@cmcbelleza.shop</a> 
con el asunto "Solicitud de eliminación de datos" 
indicando tu nombre completo y el ID de usuario 
o correo asociado a tu cuenta.</p>

<h3>Opción 3 — Por teléfono</h3>
<p>Contacta con nosotros en el número 
<a href="tel:[TELEFONO_CLIENTE]">[TELEFONO_CLIENTE]</a> 
en horario de lunes a viernes de 9:00 a 18:00h.</p>

<h2>Plazo de eliminación</h2>
<p>Una vez recibida tu solicitud, procederemos a eliminar 
todos tus datos personales en un plazo máximo de 30 días, 
conforme a lo establecido en el RGPD.</p>

<h2>Confirmación</h2>
<p>Te enviaremos un correo de confirmación una vez que 
tus datos hayan sido eliminados correctamente.</p>

<h2>Responsable del tratamiento</h2>
<p>
  Jonatan Garcia<br>
  CMC Belleza<br>
  Suiza<br>
  soporte@cmcbelleza.shop
</p>
    `,
  },
  {
    slug: 'aviso-legal',
    title: 'Aviso Legal',
    status: 'publish',
    content: `
<h2>1. Datos identificativos</h2>
<p>En cumplimiento de la Ley de Servicios de la Sociedad 
de la Información (LSSI), se facilitan los siguientes 
datos del titular del sitio web:</p>
<p>
  <strong>Titular:</strong> Jonatan Garcia<br>
  <strong>Actividad:</strong> Venta online de productos 
  de belleza y cuidado personal<br>
  <strong>Domicilio:</strong> Suiza<br>
  <strong>Correo electrónico:</strong> 
  <a href="mailto:soporte@cmcbelleza.shop">soporte@cmcbelleza.shop</a><br>
  <strong>Teléfono:</strong> [TELEFONO_CLIENTE]
</p>

<h2>2. Objeto y ámbito de aplicación</h2>
<p>El presente Aviso Legal regula el acceso y uso del 
sitio web cmcbelleza.shop, del que es titular CMC Belleza. 
El acceso y uso del sitio web implica la aceptación 
plena de este Aviso Legal.</p>

<h2>3. Propiedad intelectual e industrial</h2>
<p>Todos los contenidos del sitio web (textos, imágenes, 
diseño, logotipos y código fuente) son propiedad de 
CMC Belleza o de sus proveedores, y están protegidos 
por las leyes de propiedad intelectual e industrial.</p>
<p>Queda prohibida su reproducción, distribución, 
comunicación pública o transformación sin autorización 
expresa del titular.</p>

<h2>4. Exclusión de responsabilidad</h2>
<p>CMC Belleza no se hace responsable de los daños 
derivados del uso del sitio web, de errores en los 
contenidos ni de la disponibilidad técnica del servicio.</p>

<h2>5. Legislación aplicable</h2>
<p>Este Aviso Legal se rige por la legislación española 
y suiza vigente. Para cualquier controversia, las partes 
se someten a los juzgados y tribunales del domicilio 
del titular.</p>

<h2>6. Contacto</h2>
<p>Para cualquier consulta relacionada con este Aviso Legal:
<a href="mailto:soporte@cmcbelleza.shop">soporte@cmcbelleza.shop</a></p>
    `,
  },
];

async function createPages() {
  for (const page of pages) {
    try {
      console.log(\`Creando o actualizando página: \${page.title}...\`);
      
      const getResponse = await fetch(\`\${WP_API_URL}/wp/v2/pages?slug=\${page.slug}\`, {
        headers,
      });
      const existing = await getResponse.json();
      
      let url = \`\${WP_API_URL}/wp/v2/pages\`;
      const isUpdating = existing && Array.isArray(existing) && existing.length > 0;
      if (isUpdating) {
        url += \`/\${existing[0].id}\`;
      }
      
      const response = await fetch(url, {
        method: isUpdating ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify({
          title: page.title,
          content: page.content,
          status: page.status,
          ...(isUpdating ? {} : { slug: page.slug }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(\`❌ Error \${isUpdating ? 'actualizando' : 'creando'} "\${page.title}": \${response.status} \${response.statusText}\`);
        console.error(errorText);
      } else {
        const data = await response.json();
        console.log(\`✅ Página "\${page.title}" \${isUpdating ? 'actualizada' : 'creada'} con éxito! ID: \${data.id}\`);
        console.log(\`   URL: \${data.link}\`);
      }
    } catch (error) {
      console.error(\`❌ Excepción procesando "\${page.title}":\`, error);
    }
    console.log('-----------------------------------');
  }
}

createPages().then(() => {
  console.log('Proceso finalizado.');
});
