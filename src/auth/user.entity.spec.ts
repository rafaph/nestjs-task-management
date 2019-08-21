import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('User', () => {
    let user: User;

    beforeEach(() => {
        user = new User();
        user.password = 'testPassword';
        user.salt = 'testSalt';
        bcrypt.hash = jest.fn();
    });
    describe('validatePassword', () => {
        it('returns true as password is valid', async () => {
            bcrypt.hash.mockResolvedValue(user.password);
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('123456');
            expect(bcrypt.hash).toHaveBeenCalledWith('123456', user.salt);
            expect(result).toEqual(true);
        });

        it('returns false as password is invalid', async () => {
            bcrypt.hash.mockResolvedValue('wrongPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('wrongPassword');
            expect(bcrypt.hash).toHaveBeenCalledWith('wrongPassword', user.salt);
            expect(result).toEqual(false);
        });
    });
});
