import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { ConflictException } from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;
        const salt = await bcrypt.genSalt();
        try {
            await this.save({
                username,
                salt,
                password: await UserRepository.hashPassword(password, salt)
            });
        } catch (error) {
            if (error.code === '23505') {
                // duplicate username
                throw new ConflictException('Username already exists.');
            }
            throw error;
        }
    }

    async validateUserPassword(
        authCredentialsDto: AuthCredentialsDto
    ): Promise<string> {
        const { username, password } = authCredentialsDto;
        const user = await this.findOne({
            username
        });

        if (user && (await user.validatePassword(password))) {
            return user.username;
        }

        return null;
    }

    private static hashPassword(
        password: string,
        salt: string
    ): Promise<string> {
        return bcrypt.hash(password, salt);
    }
}
