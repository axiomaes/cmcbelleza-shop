import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();

import fs from 'fs';
import path from 'path';

async function inspect() {
  try {
    console.log('--- INSPECCIÓN DE RUTAS REST API ---');
    const response = await wp.client.get('/');
    
    const namespaces = response.data.namespaces || [];
    console.log('Namespaces Disponibles:', namespaces);
    
    const routes = Object.keys(response.data.routes || {});
    const pllRoutes = routes.filter(r => r.includes('pll') || r.includes('polylang') || r.includes('cmc'));
    console.log('\nRutas Filtradas (pll/cmc):', pllRoutes);

  } catch (error: any) {
    console.error('Error query root:', error.response?.data || error.message);
  }
}

inspect();
