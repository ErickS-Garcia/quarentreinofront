const _ = require('lodash');
const {
  Types: { ObjectId }
} = require('mongoose');
const express = require('express');

const router = express.Router();

const { requireProfessor, requireAdmin } = require('../middlewares');

const Treino = require('../models/Treino');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const treinos = await Treino.find({ [req.user.tipo]: req.user._id }, '-conteudo').populate(
      'professor aluno',
      '-password -nascimento -email -telefone'
    );
    return res.json(treinos);
  } catch (error) {
    console.error(error);
    req.session.messages = [
      ...(req.session.messages || []),
      { variant: 'danger', content: 'Erro ao carregar treinos' }
    ];
    return res.status(500).redirect('/default');
  }
});

router.post('/', requireProfessor, async (req, res) => {
  try {
    const { aluno: alunoId, nome, conteudo } = req.body;
    const idAluno = ObjectId(alunoId);
    const aluno = await User.findOne({ _id: idAluno, tipo: 'aluno' });

    if (aluno) {
      const newTreino = await Treino.create({
        professor: req.user._id,
        aluno: idAluno,
        nome,
        conteudo
      });

      return res.redirect(`/treinos/${newTreino._id}`);
    }

    req.session.messages = [
      ...(req.session.messages || []),
      { variant: 'danger', content: 'O aluno informado é inválido' }
    ];
    return res.status(422).redirect('/professor');
  } catch (error) {
    console.error(error);
    req.session.messages = [
      ...(req.session.messages || []),
      { variant: 'danger', content: 'Ocorreu um erro ao criar o treino. Por favor, tente mais tarde.' }
    ];
    return res.status(500).redirect('/professor');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const treino = await Treino.findOne({ _id: ObjectId(req.params.id) }).populate(
      'professor aluno',
      '-password -nascimento -email -telefone'
    );

    return res.render('main', {
      page: 'treino',
      path: '/:id',
      title: 'Treino | Quarentreino',
      user: req.user,
      treino
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.get('/:id/edit', requireProfessor, async (req, res) => {
  try {
    const treino = await Treino.findById(req.params.id).populate('aluno', '-password');
    return res.render('main', {
      page: 'editTreino',
      path: 'treinos/:id/edit',
      title: 'Editar Treino | Quarentreino',
      scripts: ['editTreino.js'],
      formType: 'professorEditTreino',
      values: treino,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post('/:id/edit', requireProfessor, async (req, res) => {
  try {
    const { nome, conteudo } = req.body;
    const { id } = req.params;

    await Treino.updateOne({ _id: id }, { nome, conteudo });

    return res.redirect(`/treinos/${id}`);
  } catch (error) {
    console.error(error);
    req.session.messages = [
      ...(req.session.messages || []),
      { variant: 'danger', content: 'Ocorreu um erro ao salvar o treino. Por favor, tente mais tarde.' }
    ];
    return res.status(500).redirect('/professor');
  }
});

module.exports = router;
