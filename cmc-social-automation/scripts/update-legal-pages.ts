import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WordPressService } from '../src/services/wordpress.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper para resolver las rutas a la carpeta de borradores legales en el root del monorepo
const DRAFTS_PATH = path.resolve(__dirname, '../../legal-drafts');

const wordpressService = new WordPressService();

/**
 * Carga un borrador legal, procesa sus marcadores y lo convierte a un formato apto para WP REST API
 */
function loadDraftAndProcess(filename: string): string {
  const filePath = path.join(DRAFTS_PATH, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`El borrador legal no existe en la ruta: ${filePath}`);
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Remover el encabezado de advertencia original del archivo para unificarlo con las reglas del usuario
  content = content.replace(/^# ⚠️ BORRADOR — REVISAR CON ASESOR LEGAL ANTES DE PUBLICAR\s*/i, '');

  // 2. Reemplazar todos los placeholders de datos del cliente con "[PENDIENTE]" según la regla del usuario
  const placeholders = [
    /\[COMPANY_NAME\]/g,
    /\[WEBSITE_URL\]/g,
    /\[ADDRESS\]/g,
    /\[STATE\]/g,
    /\[EMAIL\]/g,
    /\[FECHA\]/g
  ];

  placeholders.forEach((regex) => {
    content = content.replace(regex, '[PENDIENTE]');
  });

  return content.trim();
}

/**
 * Convierte Markdown elemental en formato HTML seguro para el bloque clásico o de contenido en WordPress
 */
function markdownToHtml(markdown: string): string {
  return markdown
    // Títulos
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$2</h2>') // Espera, regex index corregido
    .replace(/^## (.*$)/gim, '<h2>$1</h2>') // Por si acaso duplicado
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    // Listas viñeta
    .replace(/^\*\s+(.*$)/gim, '<li>$1</li>')
    // Negritas
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Espaciado y párrafos simples
    .split('\n').map(line => {
      if (!line.trim()) return '<br/>';
      if (line.startsWith('<h') || line.startsWith('<li') || line.startsWith('<hr')) return line;
      return `<p>${line}</p>`;
    }).join('\n');
}

// Corrección de la conversión MD -> HTML simple y robusta
function cleanMarkdownToHtml(md: string): string {
  let lines = md.split('\n');
  let inList = false;
  let htmlOutput = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Procesar negritas universales primero
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (!line) {
      if (inList) {
        htmlOutput += '</ul>\n';
        inList = false;
      }
      htmlOutput += '<p>&nbsp;</p>\n';
      continue;
    }

    // Encabezados
    if (line.startsWith('# ')) {
      if (inList) { htmlOutput += '</ul>\n'; inList = false; }
      htmlOutput += `<h1>${line.substring(2)}</h1>\n`;
    } else if (line.startsWith('## ')) {
      if (inList) { htmlOutput += '</ul>\n'; inList = false; }
      htmlOutput += `<h2>${line.substring(3)}</h2>\n`;
    } else if (line.startsWith('### ')) {
      if (inList) { htmlOutput += '</ul>\n'; inList = false; }
      htmlOutput += `<h3>${line.substring(4)}</h3>\n`;
    } else if (line.startsWith('---')) {
      if (inList) { htmlOutput += '</ul>\n'; inList = false; }
      htmlOutput += `<hr />\n`;
    } 
    // Elementos de lista
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList) {
        htmlOutput += '<ul>\n';
        inList = true;
      }
      htmlOutput += `  <li>${line.substring(2)}</li>\n`;
    } 
    // Párrafo estándar
    else {
      if (inList) {
        htmlOutput += '</ul>\n';
        inList = false;
      }
      htmlOutput += `<p>${line}</p>\n`;
    }
  }

  if (inList) {
    htmlOutput += '</ul>\n';
  }

  return htmlOutput;
}

async function run() {
  console.log('🚀 Iniciando actualización automatizada de páginas legales en WordPress...\n');

  // 1. Probar conectividad de la API
  const test = await wordpressService.testConnection();
  if (!test.success) {
    console.error(`❌ Error de Conexión API WordPress: ${test.error}`);
    process.exit(1);
  }
  console.log(`✅ Autenticación Correcta. Usuario Activo en WP: ${test.username}\n`);

  // 2. Configurar Páginas y sus Contenidos
  const pagesToUpdate = [
    {
      id: 1939,
      title: 'Términos, Privacidad y Aviso Legal',
      draftFiles: [
        '2b_terminos_condiciones_es.md',
        '1b_politica_privacidad_es.md',
        '4b_politica_reembolsos_es.md',
        '3b_politica_envios_es.md',
        '5b_politica_cookies_es.md'
      ]
    },
    {
      id: 3,
      title: 'Política de Privacidad',
      draftFiles: ['1b_politica_privacidad_es.md']
    },
    {
      id: 1937,
      title: 'Política de Cookies',
      draftFiles: ['5b_politica_cookies_es.md']
    }
  ];

  // Cabecera obligatoria solicitada por el usuario
  const disclaimerHeader = `<!-- ADVERTENCIA REVISIÓN LEGAL -->
<div style="background-color: #fff3cd; border-left: 6px solid #ffc107; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
  <h4 style="margin-top: 0; color: #856404;">⚠️ BORRADOR — Pendiente revisión legal</h4>
  <p style="margin-bottom: 0; color: #856404;">Este documento legal ha sido cargado automáticamente como borrador. Por favor, complete los datos faltantes marcados como <strong>[PENDIENTE]</strong> y valide con un asesor legal calificado en EE.UU. antes de publicar.</p>
</div>
<hr style="margin-bottom: 40px;" />\n`;

  for (const page of pagesToUpdate) {
    console.log(`[Procesando] Preparando Página ID: ${page.id} - "${page.title}"...`);

    try {
      // Unificar contenidos de múltiples borradores si aplica
      let combinedMarkdown = '';
      page.draftFiles.forEach((filename) => {
        const draftContent = loadDraftAndProcess(filename);
        combinedMarkdown += draftContent + '\n\n---\n\n';
      });

      // Convertir a HTML enriquecido para WordPress
      const bodyHtml = cleanMarkdownToHtml(combinedMarkdown.trim());
      const finalHtml = disclaimerHeader + bodyHtml;

      console.log(`[API] Enviando PATCH a WordPress para Página #${page.id}...`);
      
      // Llamar al endpoint REST de WP para actualizar la página
      const response = await wordpressService.client.patch(`/wp/v2/pages/${page.id}`, {
        title: page.title,
        content: finalHtml,
        status: 'draft' // Forzar estado borrador según las reglas
      });

      if (response.status === 200) {
        console.log(`✅ Página actualizada correctamente: "${response.data.title.rendered}" (ID: ${page.id}, Estado: ${response.data.status}, Enlace: ${response.data.link})\n`);
      } else {
        throw new Error(`Respuesta inesperada de la API: Código HTTP ${response.status}`);
      }

    } catch (error: any) {
      const errorDetails = error.response?.data?.message || error.message;
      console.error(`❌ Error al actualizar Página ID: ${page.id} — Detalle: ${errorDetails}\n`);
    }
  }

  console.log('🏁 Proceso finalizado.');
}

run();
