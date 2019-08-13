import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTasksFilterDto } from './dtos/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
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

        return query.getMany();
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;
        const task: Task = await this.save({
            title,
            description,
            user
        });
        delete task.user;
        return task;
    }
}
