import axios from 'axios';

const BASE_URL = 'https://cmcbelleza.shop';
const START_URLS = [
  `${BASE_URL}/es`,
  `${BASE_URL}/en`,
];

const visited = new Set<string>();
const queue: string[] = [...START_URLS];
const brokenLinks: Array<{ source: string; target: string; status?: number; error?: string }> = [];
const internalLinks: Set<string> = new Set();
const externalLinks: Set<string> = new Set();
const suspicionList: Array<{ source: string; target: string; reason: string }> = [];

// Regular expression to extract hrefs
const HREF_REGEX = /href=["']([^"']+)["']/g;

async function checkUrl(url: string): Promise<{ status?: number; ok: boolean; error?: string }> {
  try {
    // Use HEAD for checking to be efficient, if fails fall back to GET
    const res = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityAuditCrawler/1.0',
      },
    });
    return { status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (err: any) {
    try {
      const res2 = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityAuditCrawler/1.0',
        },
      });
      return { status: res2.status, ok: res2.status >= 200 && res2.status < 400 };
    } catch (err2: any) {
      return {
        status: err2.response?.status,
        ok: false,
        error: err2.message,
      };
    }
  }
}

async function crawl() {
  console.log('=== INICIANDO AUDITORÍA DE ENLACES Y RASTRERO DEL FRONTEND ===\n');
  
  let processedCount = 0;
  
  while (queue.length > 0) {
    const currentUrl = queue.shift()!;
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);
    
    processedCount++;
    console.log(`[${processedCount}] Rastrando: ${currentUrl}`);
    
    try {
      const response = await axios.get(currentUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityAuditCrawler/1.0',
        },
      });
      
      const html = response.data as string;
      let match;
      
      while ((match = HREF_REGEX.exec(html)) !== null) {
        const rawHref = match[1].trim();
        
        // Skip javascript:, mailto:, tel:, etc.
        if (rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
          continue;
        }
        
        // Skip anchors only
        if (rawHref.startsWith('#') && rawHref.length === 1) {
          suspicionList.push({ source: currentUrl, target: rawHref, reason: 'Enlace vacío (#)' });
          continue;
        }
        
        // Check suspicious patterns
        if (rawHref.includes('undefined') || rawHref.includes('null') || rawHref.includes('NaN') || rawHref.includes('[object')) {
          suspicionList.push({ source: currentUrl, target: rawHref, reason: 'Patrón de enlace roto (JS variable leaked)' });
          continue;
        }
        
        // Clean url
        let absoluteUrl = rawHref;
        if (rawHref.startsWith('/')) {
          absoluteUrl = `${BASE_URL}${rawHref}`;
        } else if (!rawHref.startsWith('http')) {
          // Relative link, combine with current url dir
          const base = new URL(currentUrl);
          absoluteUrl = new URL(rawHref, base.href).href;
        }
        
        // Parse to URL object to remove hashes for deduplication
        try {
          const urlObj = new URL(absoluteUrl);
          urlObj.hash = ''; // ignore fragments for crawling
          absoluteUrl = urlObj.href;
        } catch (e) {
          suspicionList.push({ source: currentUrl, target: rawHref, reason: 'URL inválida' });
          continue;
        }
        
        const isInternal = absoluteUrl.startsWith(BASE_URL);
        
        if (isInternal) {
          if (!internalLinks.has(absoluteUrl)) {
            internalLinks.add(absoluteUrl);
            // Only queue HTML pages for further crawling, avoid static files
            if (!/\.(jpg|jpeg|png|gif|svg|css|js|ico|woff|woff2|ttf|eot|pdf|zip)$/i.test(absoluteUrl)) {
              if (!visited.has(absoluteUrl) && !queue.includes(absoluteUrl)) {
                queue.push(absoluteUrl);
              }
            }
          }
        } else {
          externalLinks.add(absoluteUrl);
        }
      }
    } catch (err: any) {
      console.error(`❌ Error rastreando ${currentUrl}: ${err.message}`);
      brokenLinks.push({ source: 'Direct Seed', target: currentUrl, status: err.response?.status, error: err.message });
    }
  }
  
  console.log(`\nRastreo completado. Se encontraron ${internalLinks.size} enlaces internos y ${externalLinks.size} externos.`);
  
  // Verification phase
  console.log('\n=== VERIFICANDO TODOS LOS ENLACES INTERNOS Y EXTERNOS ===');
  
  const allToVerify = [
    ...Array.from(internalLinks).map(url => ({ url, isInternal: true })),
    ...Array.from(externalLinks).map(url => ({ url, isInternal: false })),
  ];
  
  let verifiedCount = 0;
  for (const item of allToVerify) {
    verifiedCount++;
    process.stdout.write(`\rVerificando ${verifiedCount}/${allToVerify.length}...`);
    
    const result = await checkUrl(item.url);
    if (!result.ok) {
      brokenLinks.push({
        source: 'Crawl detection',
        target: item.url,
        status: result.status,
        error: result.error,
      });
    }
  }
  console.log('\n\n=== INFORME DE ENLACES ===');
  
  console.log(`\nEnlaces rotos detectados (${brokenLinks.length}):`);
  if (brokenLinks.length === 0) {
    console.log('✅ ¡No se detectaron enlaces rotos!');
  } else {
    brokenLinks.forEach(b => {
      console.log(`- [${b.status || 'ERR'}] ${b.target} (Error: ${b.error})`);
    });
  }
  
  console.log(`\nEnlaces sospechosos / Sin usar (${suspicionList.length}):`);
  if (suspicionList.length === 0) {
    console.log('✅ No hay enlaces sospechosos.');
  } else {
    suspicionList.forEach(s => {
      console.log(`- Página origen: ${s.source}`);
      console.log(`  Enlace: "${s.target}" -> Razón: ${s.reason}`);
    });
  }
  
  console.log('\nLista de URLs internas encontradas:');
  Array.from(internalLinks).sort().forEach(url => console.log(`- ${url}`));
  
  console.log('\n=== FIN DE AUDITORÍA DE ENLACES ===');
}

crawl().catch(console.error);
