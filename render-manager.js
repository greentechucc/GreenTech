const API_KEY = 'rnd_O3sXmUt4Nvw4gDCq8VLImKMSj8Bn';
const API_URL = 'https://api.render.com/v1';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Accept': 'application/json'
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function resumeRenderArchitecture() {
  console.log("🚀 Iniciando el Despertador de Arquitectura GreenTech...\n");

  try {
    // 1. Obtener y encender la Base de Datos
    console.log("🔍 Buscando bases de datos PostgreSQL...");
    const pgRes = await fetch(`${API_URL}/postgres?limit=20`, { headers });
    const pgData = await pgRes.json();
    
    const ourDb = pgData.find(db => db.postgres.name === 'greentech-db-v2');
    
    if (ourDb) {
        console.log(`✅ Base de datos encontrada: ${ourDb.postgres.name} (${ourDb.postgres.id})`);
        console.log(`⚡ Enviando orden de encendido a la Base de Datos...`);
        const resumePg = await fetch(`${API_URL}/postgres/${ourDb.postgres.id}/resume`, { method: 'POST', headers });
        if (resumePg.ok) {
            console.log(`⏱️  Esperando a que la base de datos esté 'available' (esto puede tomar 1 o 2 minutos en el plan gratuito)...`);
            
            let isReady = false;
            while (!isReady) {
                await sleep(5000); // Check every 5 seconds
                const statusRes = await fetch(`${API_URL}/postgres/${ourDb.postgres.id}`, { headers });
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    if (statusData.status === 'available') {
                        isReady = true;
                        console.log(`✅ ¡Base de datos completamente encendida y lista!`);
                    } else {
                        process.stdout.write(`...estado actual: ${statusData.status} `);
                    }
                }
            }
        } else {
             // 400 Bad Request usually means it's already running, which is fine
             const errText = await resumePg.text();
             if(errText.includes("already running") || resumePg.status === 400) {
                 console.log("✅ La base de datos ya estaba encendida o procesando el encendido.");
             } else {
                 console.warn(`⚠️ Ocurrió un problema encendiendo la DB: ${resumePg.status} - ${errText}`);
             }
        }
    } else {
        console.log("❌ No se encontró la base de datos greentech-db-v2");
    }

    console.log("\n--------------------------------------------------------------\n");

    // 2. Obtener y encender los Microservicios
    console.log("🔍 Buscando microservicios web (Web Services)...");
    const svcRes = await fetch(`${API_URL}/services?limit=50`, { headers });
    const svcData = await svcRes.json();
    
    // Filtrar solo nuestros servicios v2
    const ourServices = svcData.filter(svc => svc.service.name.startsWith('greentech-') && svc.service.name.endsWith('-v2'));
    
    if (ourServices.length > 0) {
        console.log(`✅ Se encontraron ${ourServices.length} microservicios de GreenTech.`);
        console.log(`⚡ Enviando orden de encendido en paralelo a todos los servicios...\n`);

        const resumePromises = ourServices.map(async (svc) => {
            const name = svc.service.name;
            const res = await fetch(`${API_URL}/services/${svc.service.id}/resume`, { method: 'POST', headers });
            
            if(res.ok) {
                console.log(`🟢 ENCENDIENDO -> ${name}`);
            } else {
                const errText = await res.text();
                if(errText.includes("already running") || errText.includes("cannot be resumed") || res.status === 400) {
                     console.log(`🔵 OMITIDO -> ${name} (Ya estaba encendido u ocupado)`);
                } else {
                     console.log(`🔴 ERROR -> ${name} (${res.status}: ${errText})`);
                }
            }
        });

        await Promise.all(resumePromises);
        console.log("\n🚀 ¡Todas las ordenes han sido enviadas!");
        console.log("💡 Nota: Aunque la orden se envíe al instante, Render puede tardar unos 30-60 segundos en compilar y arrancar los contenedores en la nube.");
        console.log("📊 ¡Puedes abrir tu Grafana local para monitorear en tiempo real cuándo empiezan a responder!");

    } else {
        console.log("❌ No se encontraron microservicios con sufijo -v2");
    }

  } catch (error) {
    console.error("❌ Error grave ejecutando el script:", error);
  }
}

resumeRenderArchitecture();
