import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dtos/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dtos/get-tasks-filter.dto';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {

    async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
        const {status, search} = filterDto;
        const query = this.createQueryBuilder('task');

        if (status) {
            query.andWhere('task.status = :status', {
                status
            });
        }

        if (search) {
            query.andWhere('task.title ILIKE :search OR task.description ILIKE :search', {
                search: `%${search}%`
            });
        }

        return await query.getMany();
    }

    createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const {title, description} = createTaskDto;
        return this.save({
            title,
            description,
            status: TaskStatus.OPEN
        });
    }

}
