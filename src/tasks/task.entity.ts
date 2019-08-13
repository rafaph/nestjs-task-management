import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';

@Entity()
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({
        type: 'text'
    })
    description: string;

    @Column({
        default: TaskStatus.OPEN
    })
    status: TaskStatus;

    @ManyToOne(() => User, user => user.tasks, {
        eager: false,
        onDelete: 'CASCADE'
    })
    user: User;

    @Column()
    userId: number;
}
