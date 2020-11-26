const _ = require('lodash');
const {
  Types: { ObjectId }
} = require('mongoose');
const express = require('express');

const router = express.Router();

const { requireProfessor, requireAdmin } = require('../middlewares');

const User = require('../models/User');
const Treino = require('../models/Treino');

router.get('/', async (req, res) => {
  return res.render('main', {
    page: 'professor',
    path: '/professor',
    user: req.user,
    scripts: ['professor', '../DataTables/datatables.min.js', 'moment.min.js'],
    styles: ['../DataTables/datatables.min.css']
  });
});

router.get(['/:id/alunos', '/alunos'], requireProfessor, async (req, res) => {
  try {
    const treinos = await Treino.find({
      professor: ObjectId(req.params.id || req.user._id)
    })
      .populate('aluno')
      .lean();

    const alunos = _.map(treinos, ({ aluno }) => aluno);

    return res.json(alunos);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
