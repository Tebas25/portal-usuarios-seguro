import { Controller, Get, Render, Logger } from '@nestjs/common';
import { KmsService } from './kms/kms.service';
import axios from 'axios';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  // Inyectamos el servicio KMS en el constructor
  constructor(private readonly kmsService: KmsService) {}

  @Get()
  @Render('index')
  root() {
    return { mensaje: '¡Bienvenido al Portal de Transporte!' };
  }

  @Get('/mis-rutas')
  @Render('dashboard') // Necesitaremos crear este archivo dashboard.hbs luego
  async obtenerMisRutas() {
    // 1. Preparamos el payload (lo que queremos pedirle al Sistema B)
    const peticion = {
      usuario: 'operador_actual',
      accion: 'obtener_favoritas',
      timestamp: new Date().toISOString()
    };

    // 2. ¡ENCRIPTAMOS LA TRAMA! (Requisito de la rúbrica)
    const tramaSegura = await this.kmsService.encriptarPayload(peticion);
    this.logger.log(`Trama segura generada: ${tramaSegura.substring(0, 20)}...`);

    try {
      // 3. Enviamos SOLO la trama segura al Sistema B
      const respuestaB = await axios.post(process.env.SISTEMA_B_URL as string, {
        payloadEncriptado: tramaSegura,
      });

      // Asumimos que B responde { payloadEncriptado: string }, cifrado con la
      // misma llave de Vault. Confirmar contrato con Sistema B
      const rutasDescifradas = await this.kmsService.desencriptarPayload(
        respuestaB.data.payloadEncriptado,
      );

      return { 
        mensaje: 'Petición encriptada, enviada a B y respuesta descifrada correctamente',
        trama: tramaSegura,
        rutas: rutasDescifradas,
      };

    } catch (error: any) {
      this.logger.error('Error comunicándose con el Sistema B', error?.message || error);
      return {
        mensaje: 'Trama cifrada generada correctamente. Sistema B no respondió (debe estar levantado).',
        trama: tramaSegura,
      };
    }
  }
}