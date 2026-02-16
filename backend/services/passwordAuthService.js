
import { dbManager } from '../databaseManager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { trafficLogger } from './audit/trafficLogger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function register(req, res) {
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

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

    } catch (error) {
        console.error("Erro no registro de usuário:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao registrar o usuário.' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const user = await dbManager.users.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

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
        console.error("Erro no login:", error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

export const passwordAuthService = {
    login,
    register
};
