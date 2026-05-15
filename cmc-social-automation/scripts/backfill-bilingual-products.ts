import { ProductSetupService } from '../src/services/product-setup.service.js';

const service = new ProductSetupService();

// IDs de productos especificados en la Tarea para procesar/re-verificar
const PRODUCT_IDS = [2089, 2091, 2092, 2094];

async function runBackfill() {
  console.log('============================================================');
  console.log('🔄 INICIANDO BACKFILL: SINCRONIZACIÓN BILINGÜE EN LOTE 🔄');
  console.log('============================================================');
  console.log(`📋 Total de productos a validar: ${PRODUCT_IDS.length}\n`);

  const finalSummary = [];

  for (const id of PRODUCT_IDS) {
    console.log(`👉 Procesando producto ID #${id}...`);
    try {
      const result = await service.setupBilingualProduct(id);
      finalSummary.push(result);
    } catch (err: any) {
      finalSummary.push({
        success: false,
        status: 'failed',
        message: err.message,
        originalId: id
      });
    }
  }

  console.log('\n============================================================');
  console.log('📊 RESUMEN FINAL DE EJECUCIÓN 📊');
  console.log('============================================================');
  
  let clonedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  finalSummary.forEach((item: any, index) => {
    const statusEmoji = item.status === 'cloned' ? '🎉 [NUEVO CLON]' : item.status === 'skipped' ? '⏹️ [SALTADO]' : '❌ [ERROR]';
    console.log(`${index + 1}. ID #${item.originalId}: ${statusEmoji} -> ${item.message || 'Operación completada.'}`);
    
    if (item.status === 'cloned') clonedCount++;
    else if (item.status === 'skipped') skippedCount++;
    else failedCount++;
  });

  console.log('\n📈 Estadísticas:');
  console.log(`   - Creados: ${clonedCount}`);
  console.log(`   - Omitidos (Ya existentes): ${skippedCount}`);
  console.log(`   - Fallidos: ${failedCount}`);
  console.log('============================================================');
  console.log('🏁 BACKFILL COMPLETADO.');
}

runBackfill().catch(console.error);
