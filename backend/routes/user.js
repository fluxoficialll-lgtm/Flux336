
import express from 'express';
import { z } from 'zod';
import { UserRepository } from '../database/repositories/UserRepository.js';

const router = express.Router();

// Esquema de validação para o perfil
const profileSchema = z.object({
  nickname: z.string().min(2, 'Apelido deve ter no mínimo 2 caracteres').optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  photoUrl: z.string().url('URL da foto inválida').optional(),
});

/**
 * Middleware para garantir que o usuário está autenticado
 */
const ensureAuthenticated = (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    next();
};

router.use(ensureAuthenticated);

/**
 * @route   POST /api/user/profile
 * @desc    Atualiza o perfil do usuário
 * @access  Private
 */
router.post('/profile', async (req, res) => {
  const validation = profileSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: validation.error.flatten() });
  }

  try {
    const userId = req.user.id;
    const currentUser = await UserRepository.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Mescla os dados existentes com os novos dados
    const updatedProfile = { ...currentUser.profile, ...validation.data };
    
    await UserRepository.update({
      id: userId,
      profile: updatedProfile,
      isProfileCompleted: true // Marcar como completo após a primeira atualização
    });

    res.status(200).json({ success: true, message: 'Perfil atualizado com sucesso.', profile: updatedProfile });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar o perfil.' });
  }
});

export default router;
