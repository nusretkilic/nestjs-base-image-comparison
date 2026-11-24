import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  check(): { status: 'ok' } {
    this.logger.log('Health check requested');

    return { status: 'ok' };
  }
}