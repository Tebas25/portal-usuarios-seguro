import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { KMSClient, EncryptCommand } from '@aws-sdk/client-kms';
import * as dotenv from 'dotenv';

// Cargamos las variables del archivo .env
dotenv.config();

@Injectable()
export class KmsService {
  private readonly kmsClient: KMSClient;
  private readonly logger = new Logger(KmsService.name);

  constructor() {
    // Usamos "as string" para asegurarle a TypeScript que las variables de entorno
    // sí vendrán como texto plano y no como undefined.
    this.kmsClient = new KMSClient({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  async encriptarPayload(datos: any): Promise<string> {
    try {
      const textoPlano = JSON.stringify(datos);

      // Si no has puesto llaves reales de AWS en el .env, usamos el simulador
      if (process.env.AWS_ACCESS_KEY_ID === 'tu_access_key' || !process.env.AWS_ACCESS_KEY_ID) {
        this.logger.warn('MODO SIMULADOR: Generando trama segura de prueba sin conexión a AWS.');
        // Creamos una trama Base64 falsa que parece encriptada
        const tramaFalsa = Buffer.from(`[KMS-MOCK-ENCRIPTADO]-${textoPlano}`).toString('base64');
        return tramaFalsa;
      }

      // --- CÓDIGO REAL DE AWS KMS ---
      const bufferDatos = Buffer.from(textoPlano);
      const comando = new EncryptCommand({
        KeyId: process.env.AWS_KMS_KEY_ID as string,
        Plaintext: bufferDatos,
      });

      const respuesta = await this.kmsClient.send(comando);
      
      if (!respuesta.CiphertextBlob) {
        throw new Error('AWS KMS no devolvió el bloque encriptado.');
      }

      const tramaEncriptada = Buffer.from(respuesta.CiphertextBlob).toString('base64');
      this.logger.log('Payload encriptado exitosamente con KMS real.');
      return tramaEncriptada;

    } catch (error) {
      this.logger.error('Error al encriptar con AWS KMS', error);
      throw new InternalServerErrorException('Error procesando la seguridad del mensaje');
    }
  }
}