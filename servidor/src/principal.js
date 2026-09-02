import { iniciar } from './servidor.js';

const servidor = await iniciar();

for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, () => {
    console.log('\nEncerrando…');
    servidor.close(() => process.exit(0));
  });
}
