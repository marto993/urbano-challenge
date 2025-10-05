import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { Role } from './enums/role.enum';
import { User } from './user/user.entity';

async function createAdminOnFirstUse() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFirstName = process.env.ADMIN_FIRST_NAME;
  const adminLastName = process.env.ADMIN_LAST_NAME;

  const admin = await User.findOne({ where: { username: adminUsername } });

  if (!admin) {
      await User.create({
      firstName: adminFirstName,
      lastName: adminLastName,
      isActive: true,
      username: adminUsername,
      role: Role.Admin,
      password: await bcrypt.hash(adminPassword, 10),
    }).save();
  }
}

async function bootstrap() {
  const port = Number(process.env.BACKEND_PORT ?? 5000);
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Carna Project API')
    .setDescription('Carna Project API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await createAdminOnFirstUse();

  await app.listen(port);
}
bootstrap();
