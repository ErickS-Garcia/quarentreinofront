require('dotenv').config();

const bcrypt = require('bcrypt');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const moment = require('moment');
const User = require('../models/User');
const userData = {
  nome: 'Pedro',
  sobrenome: 'Padilha',
  email: 'pedropadilha@me.com',
  password: '12345678',
  nascimento: '29/01/1999',
  telefone: '(11) 98847-8390',
  tipo: 'admin'
};

const { MONGO_TEST_URI } = process.env;

const removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);

  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
};

describe('User Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_TEST_URI, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await removeAllCollections();
  });

  it('Create and Save User', async () => {
    const validUser = new User({
      ...userData,
      nascimento: moment(userData.nascimento, 'DD/MM/YYYY').toISOString()
    });

    const savedUser = await validUser.save();

    const user = await User.findOne({ _id: savedUser._id });

    expect(user._id).toBeDefined();
    expect(user.nome).toBe(userData.nome);
    expect(user.sobrenome).toBe(userData.sobrenome);
    expect(user.email).toBe(userData.email);
    expect(bcrypt.compareSync(userData.password, user.password)).toBe(true);
    expect(moment(user.nascimento).format('DD/MM/YYYY')).toBe(userData.nascimento);
    expect(user.telefone).toBe(userData.telefone);
    expect(user.tipo).toBe(userData.tipo);
  });

  it("Create user and attempt to create another user with duplicate 'unique' field", async () => {
    const validUser = await User.create({
      ...userData,
      nascimento: moment(userData.nascimento, 'DD/MM/YYYY').toISOString()
    });

    const user = await User.findOne({ _id: validUser._id });

    expect(user._id).toBeDefined();

    let error;

    try {
      const invalidUser = await User.create({
        ...userData,
        nascimento: moment(userData.nascimento, 'DD/MM/YYYY').toISOString()
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongo.MongoError);
    expect(error.keyValue.email).toBeDefined();
  });

  it('Create User successfully, but field not defined in Schema should be undefined', async () => {
    const userWithInvalidField = new User({
      ...userData,
      nascimento: moment(userData.nascimento, 'DD/MM/YYYY').toISOString(),
      username: 'pedropadilha13'
    });

    const savedUserWithInvalidField = await userWithInvalidField.save();

    const user = await User.findOne({ _id: savedUserWithInvalidField._id });

    expect(user._id).toBeDefined();
    expect(user.username).toBeUndefined();
  });

  it('Create User without required field', async () => {
    const userWithoutRequiredField = new User({ nome: 'Perdo' });
    let error;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.sobrenome).toBeDefined();
  });
});
