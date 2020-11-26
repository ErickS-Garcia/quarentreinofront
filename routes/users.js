const express = require('express');
const moment = require('moment');
const router = express.Router();

const { requireAuth, requireAdmin } = require('../middlewares');

const User = require('../models/User');

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').lean();
    return res.json({ data: users });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.get('/me', requireAuth, (req, res) => {
  return res.json(req.user);
});

router.get('/new', requireAdmin, async (req, res) => {
  return res.render('main', {
    page: 'createUser',
    path: '/:id/createUser',
    title: 'Novo Usuário | Quarentreino',
    scripts: ['jquery.mask.min.js', 'editUser.js'],
    formType: 'adminCreateUser',
    user: req.user
  });
});

router.post('/new', requireAdmin, async (req, res) => {
  let { nome, sobrenome, email, password, nascimento, telefone, tipo } = req.body;

  const errors = {};

  if (!nome) {
    errors.nome = 'Campo obrigatório';
  }

  if (!sobrenome) {
    errors.sobrenome = 'Campo obrigatório';
  }

  if (!email) {
    errors.email = 'Campo obrigatório';
  } else if (!email.match(EMAIL_REGEX)) {
    errors.email = 'E-mail inválido';
  } else {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errors.email = 'Email já cadastrado';
    }
  }

  if (password.length < 8) {
    errors.password = 'A senha deve conter pelo menos 8 caracteres';
  }

  if (!nascimento) {
    errors.nascimento = 'Campo obrigatório';
  } else if (!moment(nascimento, 'DD/MM/YYYY').isValid()) {
    errors.nascimento = 'Data inválida';
  }

  if (Object.keys(errors).length !== 0) {
    return res.status(422).render('main', {
      page: 'createUser',
      path: '/:id/createUser',
      title: 'Novo Usuário | Quarentreino',
      scripts: ['jquery.mask.min.js', 'editUser.js'],
      formType: 'adminCreateUser',
      user: req.user,
      values: { nome, sobrenome, email, password, nascimento, telefone, tipo },
      errors
    });
  }

  try {
    await User.create({
      nome,
      sobrenome,
      email,
      password,
      nascimento: moment(nascimento, 'DD/MM/YYYY'),
      telefone,
      tipo
    });

    req.session.messages = [
      ...(req.session.messages || []),
      { variant: 'success', content: `Usuário "${nome}" cadastrado com sucesso!` }
    ];

    return res.status(201).redirect('/admin');
  } catch (error) {
    console.error(error);
    req.session.messages = [
      ...(req.session.messages || []),
      { variant: 'danger', content: `Ocorreu um erro ao cadastrar o usuário "${nome}". Por favor, tente mais tarde.` }
    ];
    return res.status(500).redirect('/admin');
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, '-password');
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
});

router.get('/:id/edit', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password').lean();
    return res.render('main', {
      page: 'editUser',
      path: '/:id/editUser',
      title: 'Editar Usuário | Quarentreino',
      scripts: ['jquery.mask.min.js', 'editUser.js'],
      formType: 'adminEditUser',
      values: { ...user, nascimento: moment(user.nascimento).format('DD/MM/YYYY') },
      user: req.user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
});

router.post('/:id/edit', requireAdmin, async (req, res) => {
  const { id } = req.params;
  let { nome, sobrenome, email, nascimento, telefone, tipo } = req.body;

  const errors = {};

  if (!nome) {
    errors.nome = 'Campo obrigatório';
  }

  if (!sobrenome) {
    errors.sobrenome = 'Campo obrigatório';
  }

  if (!nascimento) {
    errors.nascimento = 'Campo obrigatório';
  } else if (!moment(nascimento, 'DD/MM/YYYY').isValid()) {
    errors.nascimento = 'Data inválida';
  }

  if (Object.keys(errors).length !== 0) {
    return res.status(422).render('main', {
      page: 'editUser',
      path: '/:id/editUser',
      title: 'Editar Usuário | Quarentreino',
      user: req.user,
      values: { nome, sobrenome, email, nascimento, telefone, tipo },
      errors
    });
  }

  try {
    await User.updateOne(
      { _id: id },
      {
        nome,
        sobrenome,
        nascimento: moment(nascimento, 'DD/MM/YYYY'),
        telefone,
        tipo
      }
    );
    return res.status(201).redirect('/admin');
  } catch (error) {
    console.error(error);
    return res.status(500).render('main', {
      page: 'editUser',
      path: '/:id/editUser',
      title: 'Editar Usuário | Quarentreino',
      user: req.user,
      values: { nome, sobrenome, email, nascimento, telefone, tipo },
      errors
    });
  }
});

module.exports = router;
