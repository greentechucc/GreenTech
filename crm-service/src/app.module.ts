import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProspectsModule } from './prospects/prospects.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'postgres',
      database: 'crm_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProspectsModule,
  ],
})
export class AppModule {}