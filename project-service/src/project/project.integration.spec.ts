import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Incident } from './incident.entity';

// Configurar Mock de Redis que previene conexiones reales en la prueba de integración
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      publish: jest.fn(),
      quit: jest.fn(),
      disconnect: jest.fn(),
    };
  });
});

describe('ProjectController (e2e) Integration', () => {
  let app: INestApplication;
  
  // Mocks 1 y 2 en pruebas de integración (Repositorios de DB)
  const projectRepoMock = {
    find: jest.fn().mockResolvedValue([{ id: 1, name: 'Project 1' }]),
    findOneBy: jest.fn().mockResolvedValue({ id: 1, name: 'Project 1' }),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 1, ...dto })),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const incidentRepoMock = {
    find: jest.fn().mockResolvedValue([{ id: 1, description: 'Test Incident' }]),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 1, ...dto })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        ProjectService,
        { provide: getRepositoryToken(Project), useValue: projectRepoMock },
        { provide: getRepositoryToken(Incident), useValue: incidentRepoMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Test 1: GET findAll
  it('/projects (GET)', () => {
    return request(app.getHttpServer())
      .get('/projects')
      .expect(200)
      .expect([{ id: 1, name: 'Project 1' }]);
  });

  // Test 2: POST create
  it('/projects (POST)', () => {
    return request(app.getHttpServer())
      .post('/projects')
      .send({ customer_name: 'Test Customer' })
      .expect(201)
      .expect((res) => {
        expect(res.body.customer_name).toBe('Test Customer');
      });
  });

  // Test 3: GET findOne
  it('/projects/1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/projects/1')
      .expect(200)
      .expect({ id: 1, name: 'Project 1' });
  });

  // Test 4: PUT update
  it('/projects/1 (PUT)', () => {
    return request(app.getHttpServer())
      .put('/projects/1')
      .send({ status: 'APPROVED' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('APPROVED');
      });
  });

  // Test 5: DELETE remove
  it('/projects/1 (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/projects/1')
      .expect(200)
      .expect({ deleted: true });
  });

  // Test 6: POST create incident
  it('/projects/1/incidents (POST)', () => {
    return request(app.getHttpServer())
      .post('/projects/1/incidents')
      .send({ description: 'Test Incident' })
      .expect(201)
      .expect((res) => {
        expect(res.body.description).toBe('Test Incident');
      });
  });

  // Test 7: GET incidents
  it('/projects/1/incidents (GET)', () => {
    return request(app.getHttpServer())
      .get('/projects/1/incidents')
      .expect(200);
  });

  // Test 8: PUT resolve incident
  it('/projects/incidents/1/resolve (PUT)', () => {
    return request(app.getHttpServer())
      .put('/projects/incidents/1/resolve')
      .expect(200);
  });
});
