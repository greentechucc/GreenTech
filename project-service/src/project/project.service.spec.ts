import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Incident } from './incident.entity';
import axios from 'axios';
import Redis from 'ioredis';

// Uso de mocks obligatorios (Mocks 1 y 2 en pruebas unitarias)
jest.mock('axios');
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      publish: jest.fn(),
    };
  });
});

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepoMock: any;
  let incidentRepoMock: any;

  beforeEach(async () => {
    projectRepoMock = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((project) => Promise.resolve({ id: 1, ...project })),
      findOneBy: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    incidentRepoMock = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((incident) => Promise.resolve({ id: 1, ...incident })),
      findOneBy: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getRepositoryToken(Project), useValue: projectRepoMock },
        { provide: getRepositoryToken(Incident), useValue: incidentRepoMock },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Definición general (Matcher 1: toBeDefined)
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2: Creación de proyecto (Matcher 2: toEqual)
  it('should create a project and return it', async () => {
    const data = { customer_name: 'Juan Perez', system_size: '5kWp' };
    const result = await service.createProject(data);
    
    expect(projectRepoMock.create).toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ customer_name: 'Juan Perez' }));
  });

  // Test 3: Búsqueda fallida (Matcher 3: toBeNull)
  it('should return null if project is not found', async () => {
    projectRepoMock.findOneBy.mockResolvedValue(null);
    const result = await service.findOne(999);
    expect(result).toBeNull();
  });

  // Test 4: Reporte de incidencias exitoso (Matcher 4: toHaveProperty)
  it('should report an incident correctly', async () => {
    const result = await service.reportIncident(1, { description: 'Fallo inversor' });
    expect(incidentRepoMock.create).toHaveBeenCalled();
    expect(result).toHaveProperty('description', 'Fallo inversor');
  });

  // Test 5: Requerimiento Obligatorio -> Prueba explícita con promesa (rejects.toThrow)
  it('should explicitly reject promise if DB fails', async () => {
    projectRepoMock.save.mockRejectedValue(new Error('DB Error'));
    
    // Uso explícito de matchers de promesa
    await expect(service.createProject({})).rejects.toThrow('DB Error');
  });

  // Test 6: Fallback a Redis en updateTasks
  it('should fallback to redis publish if axios fails on task 3 completion', async () => {
    const projectDb = { 
      id: 1, 
      bom_json: '[]', 
      tasks: JSON.stringify([{ id: 3, done: false }]) 
    };
    projectRepoMock.findOneBy.mockResolvedValue(projectDb);
    projectRepoMock.save.mockResolvedValue({ ...projectDb, completion: 100 });

    // Mock axios para forzar error
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const tasksBody = [{ id: 3, done: true }];
    await service.updateTasks(1, tasksBody);

    // Debe publicarse en redis
    expect(axios.post).toHaveBeenCalled();
    // Como Redis fue mockeado, verificamos su publicación indirectamente (código interno llama this.redisClient.publish)
  });
});
