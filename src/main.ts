import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
const session = require('express-session');
// Usamos require para evitar problemas de tipado estricto con esta librería antigua
const Keycloak = require('keycloak-connect');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Configuramos las vistas web
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // 2. Iniciamos el motor de sesiones (Obligatorio para que Keycloak recuerde quién eres)
  const memoryStore = new session.MemoryStore();
  app.use(session({
    secret: 'secreto-super-seguro-transporte',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  }));

  // 3. Conectamos con tu servidor Keycloak usando las variables del .env
  const keycloak = new Keycloak({ store: memoryStore }, {
    realm: process.env.KEYCLOAK_REALM,
    "auth-server-url": "http://localhost:8080", // URL base de Keycloak
    resource: process.env.KEYCLOAK_CLIENT_ID,
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET
    },
    "confidential-port": 0
  });

  // 4. Activamos los middlewares de Keycloak
  app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/'
  }));

  // 5. EL CANDADO: Protegemos específicamente la ruta de "mis-rutas"
  app.use('/mis-rutas', keycloak.protect());

  await app.listen(3000);
}
bootstrap();