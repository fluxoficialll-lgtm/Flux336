
import { dbManager } from '../databaseManager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger, config } from '../config.js';

const JWT_SECRET = config.JWT_SECRET;

async function register(req, res, next) {
    // ... (código de registro inalterado)
    const { email, password, name, nickname } = req.body;

    if (!email || !password || !name || !nickname) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios: email, senha, nome e apelido.' });
    }

    try {
        const existingUser = await dbManager.users.findByEmail(email);
        if (existingUser) {
            logger.logSystem('warn', 'Tentativa de registro com e-mail já existente.', { email, traceId: req.traceId });
            return res.status(409).json({ error: 'O e-mail fornecido já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await dbManager.users.create({
            email,
            password: hashedPassword,
            name,
            profile: { name, nickname }
        });

        logger.logSystem('info', 'Novo usuário registrado com senha.', { userId: newUser.id, email, traceId: req.traceId });
        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

    } catch (error) {
        logger.logError(error, req, 'Erro no registro de usuário com senha.');
        next(error);
    }
}

async function login(req, res, next) {
    const { email, password } = req.body;
    const traceId = req.traceId; // Captura o traceId da requisição

    if (!email || !password) {
        logger.logSystem('warn', 'Tentativa de login com campos ausentes.', { email, traceId });
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        logger.logSystem('info', 'Iniciando autenticação por e-mail e senha.', { email, traceId });
        const user = await dbManager.users.findByEmail(email);
        
        if (!user || !user.password) {
            logger.logSystem('warn', 'Tentativa de login com usuário não encontrado.', { email, traceId });
            return res.status(404).json({ error: 'Usuário não encontrado ou não registrado com senha.' });
        }

        logger.logSystem('info', 'Usuário encontrado.', { userId: user.id, email, traceId });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.logSystem('warn', 'Tentativa de login com senha inválida.', { userId: user.id, email, traceId });
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        
        logger.logSystem('info', 'Validação de senha bem-sucedida.', { userId: user.id, email, traceId });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        logger.logSystem('info', 'Token de acesso gerado e resposta enviada.', { userId: user.id, traceId });
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
        next(error);
    }
}

export const passwordAuthService = {
    login,
    register
};
