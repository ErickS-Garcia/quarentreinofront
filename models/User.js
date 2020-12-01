const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  nome: {
    type: String,
    trim: true,
    required: [true, 'First name is required']
  },
  sobrenome: {
    type: String,
    trim: true,
    required: [true, 'Last name is required']
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'Email is required'],
    unique: [true, 'Email must be unique']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  nascimento: {
    type: Date,
    required: [true, 'Data de Nascimento is required']
  },
  telefone: {
    type: String,
    required: false
  },
  tipo: {
    type: String,
    enum: ['aluno', 'professor', 'admin'],
    default: 'aluno'
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

UserSchema.static('findByEmail', async function (email) {
  return await this.findOne({ email });
});

UserSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  this.updated = Date.now();
  return next();
});

UserSchema.pre('updateOne', function (next) {
  this.update({}, { $set: { updated: Date.now() } });
  next();
});

UserSchema.methods.verifyPassword = function (password) {
  return new Promise(async resolve => {
    const passwordIsCorrect = await bcrypt.compare(password, this.password);
    resolve(passwordIsCorrect);
  });
};

UserSchema.methods.updatePassword = function (newPassword) {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      this.password = hashedPassword;
      this.save();
      resolve(this);
    } catch (err) {
      reject(err);
    }
  });
};

UserSchema.methods.getName = function () {
  return `${this.nome} ${this.sobrenome}`;
};

module.exports = mongoose.model('User', UserSchema);
