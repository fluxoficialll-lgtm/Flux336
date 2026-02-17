
import { dbManager } from '../databaseManager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger, config } from '../config.js'; // Importa o logger e a config

const JWT_SECRET = config.JWT_SECRET;

async function register(req, res, next) {
    const { email, password, name, nickname } = req.body;

    if (!email || !password || !name || !nickname) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios: email, senha, nome e apelido.' });
    }

    try {
        const existingUser = await dbManager.users.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'O e-mail fornecido já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await dbManager.users.create({
            email,
            password: hashedPassword,
            name,
            profile: { name, nickname }
        });

        logger.logSystem('info', 'Novo usuário registrado com senha.', { userId: newUser.id, email });
        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

    } catch (error) {
        logger.logError(error, req, 'Erro no registro de usuário com senha.');
        next(error); // Passa para o error handler global
    }
}

async function login(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const user = await dbManager.users.findByEmail(email);
        if (!user || !user.password) { // Garante que o usuário tem senha
            return res.status(404).json({ error: 'Usuário não encontrado ou não registrado com senha.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        logger.logSystem('info', 'Usuário logado com senha.', { userId: user.id, email });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile
            }
        });

    } catch (error) {
        logger.logError(error, req, 'Erro no login de usuário com senha.');
        next(error); // Passa para o error handler global
    }
}

export const passwordAuthService = {
    login,
    register
};
