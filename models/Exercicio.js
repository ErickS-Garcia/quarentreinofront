const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExercicioSchema = new Schema({
  nome: {
    type: String
  },
  descricao: {
    type: String
  },
  observacoes: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

ExercicioSchema.pre('updateOne', function (next) {
  this.update({}, { $set: { updated: Date.now() } });
  next();
});

module.exports = mongoose.model('Exercicio', ExercicioSchema);
