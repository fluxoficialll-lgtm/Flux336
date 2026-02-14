
import bcrypt from 'bcryptjs';
import { dbManager } from '../databaseManager.js';

const saltRounds = 10;

async function hashPassword(password) {
    if (!password) {
        return null;
    }
    return await bcrypt.hash(password, saltRounds);
}

async function registerUser(userData) {
    const { email, password, ...otherData } = userData;

    if (!email || !password) {
        throw new Error('Email e senha são obrigatórios para o registro.');
    }

    const existingUser = await dbManager.users.findByEmail(email);
    if (existingUser) {
        throw new Error('Este e-mail já está em uso.');
    }

    const password_hash = await hashPassword(password);

    const newUser = {
        email,
        password_hash,
        ...otherData
    };

    const userId = await dbManager.users.create(newUser);
    return await dbManager.users.findById(userId);
}

export const passwordAuthService = {
    hashPassword,
    registerUser
};
