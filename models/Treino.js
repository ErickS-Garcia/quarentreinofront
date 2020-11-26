const mongoose = require('mongoose');
const {
  Schema,
  Types: { ObjectId }
} = mongoose;
const ExercicioSchema = require('./Exercicio').schema;

const TreinoSchema = new Schema({
  aluno: {
    type: ObjectId,
    ref: 'User'
  },
  professor: {
    type: ObjectId,
    ref: 'User'
  },
  nome: {
    type: String,
    required: [true, 'Nome do treino é obrigatório']
  },
  conteudo: [ExercicioSchema],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

TreinoSchema.pre('updateOne', function (next) {
  this.update({}, { $set: { updated: Date.now() } });
  next();
});

module.exports = mongoose.model('Treino', TreinoSchema);
