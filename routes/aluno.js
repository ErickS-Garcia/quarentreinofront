const express = require('express');
const router = express.Router();

const Treino = require('../models/Treino');

router.get('/', async (req, res) => {
  const { _id } = req.user;
  const treinos = await Treino.find({ aluno: _id });
  console.log(treinos);
  return res.render('main', {
    page: 'aluno',
    path: '/aluno',
    user: req.user,
    treinos
  });
});

module.exports = router;
