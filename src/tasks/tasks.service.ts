import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dtos/create-task.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { GetTasksFilterDto } from './dtos/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
    private readonly taskRepository: TaskRepository;

    constructor(
        @InjectRepository(TaskRepository) taskRepository: TaskRepository
    ) {
        this.taskRepository = taskRepository;
    }

    getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        return this.taskRepository.getTasks(filterDto, user);
    }

    async getTaskById(id: number, user: User): Promise<Task> {
        const found = await this.taskRepository.findOne({
            where: {
                id,
                userId: user.id
            }
        });
        if (!found) {
            throw new NotFoundException(`Task with ID "${id}" not found.`);
        }
        return found;
    }

    createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        return this.taskRepository.createTask(createTaskDto, user);
    }

    async deleteTask(id: number, user: User): Promise<void> {
        const { affected } = await this.taskRepository.delete({
            id,
            userId: user.id
        });

        if (affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found.`);
        }
    }

    async updateTaskStatus(
        id: number,
        status: TaskStatus,
        user: User
    ): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await task.save();
        return task;
    }
}
