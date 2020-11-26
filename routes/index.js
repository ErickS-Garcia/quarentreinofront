const express = require('express');
const router = express.Router();

const { requireAuth, requireAluno, requireProfessor, requireAdmin } = require('../middlewares');

const authRouter = require('./auth');
const usersRouter = require('./users');
const adminRouter = require('./admin');
const alunoRouter = require('./aluno');
const treinosRouter = require('./treinos');
const professorRouter = require('./professor');

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/aluno', requireAuth, requireAluno, alunoRouter);
router.use('/professor', requireAuth, requireProfessor, professorRouter);
router.use('/admin', requireAuth, requireAdmin, adminRouter);
router.use('/treinos', treinosRouter);

router.get('/', async (req, res) => {
  return res.render('main', {
    page: 'index',
    path: '/',
    user: req.user
  });
});

router.get('/about', async (req, res) => {
  return res.render('main', {
    page: 'about',
    path: '/about',
    user: req.user
  });
});

router.get('/default', requireAuth, async (req, res) => {
  return res.redirect(`/${req.user.tipo}`);
});

module.exports = router;
