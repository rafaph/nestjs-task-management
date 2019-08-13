import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTasksFilterDto } from './dtos/get-tasks-filter.dto';
import { User } from '../auth/user.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    private readonly logger: Logger = new Logger('TaskRepository');

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('task');

        query.where('task.userId = :userId', {
            userId: user.id
        });

        if (status) {
            query.andWhere('task.status = :status', {
                status
            });
        }

        if (search) {
            query.andWhere(
                'task.title ILIKE :search OR task.description ILIKE :search',
                {
                    search: `%${search}%`
                }
            );
        }

        try {
            return await query.getMany();
        } catch (error) {
            this.logger.error(
                `Failed to get tasks for user "${
                    user.username
                }". Filters: ${JSON.stringify(filterDto)}`,
                error.stack
            );
            throw new InternalServerErrorException();
        }
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;
        let task: Task;

        try {
            task = await this.save({
                title,
                description,
                user
            });
        } catch (error) {
            this.logger.error(
                `Failed create a task for user "${
                    user.username
                }". Data: ${JSON.stringify(createTaskDto)}`,
                error.stack
            );
            throw new InternalServerErrorException();
        }

        delete task.user;
        return task;
    }
}
