import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5441, // TimescaleDB instance map
      username: 'postgres',
      password: 'postgres',
      database: 'monitoring_db',
      autoLoadEntities: true,
      synchronize: true, // Only for development; Timescale hypertable creation needs custom query
    }),
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
