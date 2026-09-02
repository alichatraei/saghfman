import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { PropertiesModule } from '../properties/properties.module';
import { UsersModule } from '../users/users.module';

@Module({ imports: [PropertiesModule, UsersModule], controllers: [MeController] })
export class MeModule {}
