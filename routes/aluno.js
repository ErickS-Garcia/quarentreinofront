const express = require('express');
const router = express.Router();

const Treino = require('../models/Treino');

router.get('/', async (req, res) => {
  const { _id } = req.user;
  const treinos = await Treino.find({ aluno: _id });
  const exercicios = treinos.conteudo
  console.log(treinos);
  return res.render('main', {
    page: 'aluno',
    path: '/aluno',
    user: req.user,
    values: {
      treinos,
      exercicios
    },
    scripts: ['professor', '../DataTables/datatables.min.js', 'moment.min.js'],
    styles: ['../DataTables/datatables.min.css']
  });
});

module.exports = router;
