import fs from 'fs';
import path from 'path';
import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();

async function inspect() {
  try {
    const contact = await wp.client.get('/wp/v2/pages/2073');
    console.log('--- VERIFICACIÓN CONTACTO EN (2073) ---');
    console.log('Lang:', contact.data.lang);
    console.log('Translations:', contact.data.translations);

    const blog = await wp.client.get('/wp/v2/pages/2075');
    console.log('\n--- VERIFICACIÓN BLOG EN (2075) ---');
    console.log('Lang:', blog.data.lang);
    console.log('Translations:', blog.data.translations);
  } catch (error: any) {
    console.error('Error testing:', error.message);
  }
}

inspect();
