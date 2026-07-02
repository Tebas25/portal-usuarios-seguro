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
    return { mensaje: '¡Bienvenido al Sistema A (Portal de Transporte)!' };
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
      // (Comentado temporalmente hasta que levantemos el Sistema B)
      /*
      const respuestaB = await axios.post(process.env.SISTEMA_B_URL, {
        payloadEncriptado: tramaSegura
      });
      
      // Aquí iría el parser del CSV de 10 campos que devolverá B
      const rutasProcesadas = procesarCSV(respuestaB.data);
      */

      // Retorno temporal (Mock) para que la vista no falle
      return { 
        mensaje: 'Petición encriptada y enviada a B', 
        trama: tramaSegura 
      };

    } catch (error) {
      this.logger.error('Error comunicándose con el Sistema B', error);
      return { mensaje: 'Error de comunicación' };
    }
  }
}