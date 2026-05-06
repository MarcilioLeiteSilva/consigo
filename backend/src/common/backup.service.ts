import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleBackup() {
    this.logger.log('Iniciando backup automático do banco de dados...');
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      this.logger.error('DATABASE_URL não configurada.');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, fileName);

    try {
      // Nota: pg_dump precisa estar instalado na máquina/container
      await execPromise(`pg_dump "${dbUrl}" > "${filePath}"`);
      this.logger.log(`Backup concluído com sucesso: ${fileName}`);
      
      // Limpar backups antigos (manter últimos 7 dias)
      this.cleanOldBackups();
    } catch (error) {
      this.logger.error('Erro ao realizar backup:', error.message);
    }
  }

  private cleanOldBackups() {
    const files = fs.readdirSync(this.backupDir);
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > sevenDaysMs) {
        fs.unlinkSync(filePath);
        this.logger.log(`Backup antigo removido: ${file}`);
      }
    });
  }
}
