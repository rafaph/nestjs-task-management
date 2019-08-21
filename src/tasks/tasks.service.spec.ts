import { DeleteResult } from 'typeorm';
import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';
import { Task } from './task.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTasksFilterDto } from './dtos/get-tasks-filter.dto';

const mockUser = new User();
mockUser.id = 12;
mockUser.username = 'Test user';

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn()
});

describe('TasksService', () => {
    let tasksService: TasksService;
    let taskRepository: TaskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: TaskRepository, useFactory: mockTaskRepository }
            ]
        }).compile();

        tasksService = module.get<TasksService>(TasksService);
        taskRepository = module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('gets all tasks from the repository', async () => {
            const mockTask = new Task();
            mockTask.title = 'some value';
            const expectedResult = [mockTask];

            jest.spyOn(taskRepository, 'getTasks').mockResolvedValue(
                expectedResult
            );

            expect(taskRepository.getTasks).not.toHaveBeenCalled();
            const filterDto: GetTasksFilterDto = {
                status: TaskStatus.IN_PROGRESS,
                search: 'Some search query'
            };
            const result = await tasksService.getTasks(filterDto, mockUser);
            expect(taskRepository.getTasks).toHaveBeenCalledWith(
                filterDto,
                mockUser
            );
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getTaskById', () => {
        it('calls taskRepository.findOne() and succesfully retrieve and return the task', async () => {
            const mockTask = new Task();
            mockTask.title = 'Test task';
            mockTask.description = 'Test desc';
            jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);

            const result = await tasksService.getTaskById(1, mockUser);
            expect(result).toEqual(mockTask);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId: mockUser.id
                }
            });
        });

        it('throws an error as task is not found', async () => {
            jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);
            await expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('createTask', () => {
        it('calls taskRepository.create() and returns the result', async () => {
            const expectedResult = new Task();
            expectedResult.title = 'a title';
            expectedResult.description = 'a desc';
            delete expectedResult.user;

            jest.spyOn(taskRepository, 'createTask').mockResolvedValue(
                expectedResult
            );

            expect(taskRepository.createTask).not.toHaveBeenCalled();
            const createTaskDto: CreateTaskDto = {
                title: expectedResult.title,
                description: expectedResult.description
            };
            const result = await tasksService.createTask(
                createTaskDto,
                mockUser
            );
            expect(taskRepository.createTask).toHaveBeenCalledWith(
                createTaskDto,
                mockUser
            );
            expect(result).toEqual(expectedResult);
        });
    });

    describe('deleteTask', () => {
        it('call taskRepository.deleteTask() to delete task', async () => {
            jest.spyOn(taskRepository, 'delete').mockResolvedValue({
                affected: 1
            } as DeleteResult);

            expect(taskRepository.delete).not.toHaveBeenCalled();
            await tasksService.deleteTask(1, mockUser);
            expect(taskRepository.delete).toHaveBeenCalledWith({
                id: 1,
                userId: mockUser.id
            });
        });

        it('throws an error as task could not be found', async () => {
            jest.spyOn(taskRepository, 'delete').mockResolvedValue({
                affected: 0
            } as DeleteResult);

            await expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('updateTaskStatus', () => {
        it('updates a task status', async () => {
            const save = jest.fn().mockResolvedValue(true);
            tasksService.getTaskById = jest.fn().mockResolvedValue({
                status: TaskStatus.OPEN,
                save
            });

            expect(tasksService.getTaskById).not.toHaveBeenCalled();
            const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
            expect(tasksService.getTaskById).toHaveBeenCalledWith(1, mockUser);
            expect(save).toHaveBeenCalled();
            expect(result.status).toEqual(TaskStatus.DONE);
        });
    });
});
