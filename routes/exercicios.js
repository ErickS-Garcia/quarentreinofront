const _ = require('lodash');
const {
  Types: { ObjectId }
} = require('mongoose');
const express = require('express');

const router = express.Router();

const { requireProfessor, requireAdmin, requireAuth } = require('../middlewares');
const Exercicio = require('../models/Exercicio');

router.get('/', requireProfessor, async (req, res) => {
  try {
    const exercicios = await Exercicio.find({})
    return res.json(exercicios);
  } catch (error) {
    console.error(error);
    req.session.messages = [
      ...(req.session.messages || []),
      { variant: 'danger', content: 'Erro ao carregar exercicios' }
    ];
    return res.status(500).redirect('/default');
  }
})

router.get('/:id', requireAuth , async (req, res) => {
  const exercicio = await Exercicio.findOne({_id: req.params.id})
  return res.render('main', {
    page: 'exercicio',
    path: '/:id',
    formTitle: 'Exercício',
    user: req.user,
    exercicio
  })
})

router.delete('/:id', requireProfessor, async (req, res) => {
  try {
    const exercicio = await Exercicio.findOneAndDelete({ _id: req.params.id }, function (err, docs) {
      if (err){
          console.log(err)
      }
      else{
          console.log("Deleted User : ", docs);
      }
    })
    return res.json({
      message: "Exercicio deletado!",
      exercicio
    });
  } catch (error) {
    console.error(error);
    req.session.messages = [
      ...(req.session.messages || []),
      { variant: 'danger', content: 'Erro ao carregar exercicios' }
    ];
    return res.status(500).redirect('/default');
  }
})

module.exports = router;
