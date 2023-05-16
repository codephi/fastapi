if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { faker } = require('@faker-js/faker');
const { sequelize } = require('./src/middle/database');

const { importModel } = require('./src/engine/sequelize/generateModel');

const models = importModel();
const { Client, User, Tag, Post, Comment, Vote } = models;

const CLIENTS_COUNT = 50;
const USERS_COUNT = 20;
const POSTS_COUNT = 50;
const COMMENTS_COUNT = 100;
const TAGS_COUNT = 10;

(async () => {
  await sequelize.sync({ force: true });

  // Criar clientes
  const clients = await Client.model.bulkCreate(
    [...Array(CLIENTS_COUNT)].map(() => ({
      name: faker.company.name(),
    }))
  );

  // Criar usuários
  const users = await User.model.bulkCreate(
    [...Array(USERS_COUNT)].map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      clientId: clients[Math.floor(Math.random() * clients.length)].id,
    }))
  );

  // Criar tags
  const tags = await Tag.model.bulkCreate(
    [...Array(TAGS_COUNT)].map(() => ({
      name: faker.lorem.word(),
      clientId: clients[Math.floor(Math.random() * clients.length)].id,
    }))
  );

  // Criar posts
  const posts = await Post.model.bulkCreate(
    [...Array(POSTS_COUNT)].map(() => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      userId: users[Math.floor(Math.random() * users.length)].id,
      tagId: tags[Math.floor(Math.random() * tags.length)].id,
    }))
  );

  // Criar comentários
  const comments = await Comment.model.bulkCreate(
    [...Array(COMMENTS_COUNT)].map(() => ({
      text: faker.lorem.paragraph(),
      userId: users[Math.floor(Math.random() * users.length)].id,
      postId: posts[Math.floor(Math.random() * posts.length)].id,
    }))
  );

  function randomBoolean() {
    return Math.random() >= 0.5;
  }

  // Criar votos
  await Vote.model.bulkCreate(
    [...Array(POSTS_COUNT + COMMENTS_COUNT)].map(() => ({
      type: randomBoolean() ? 1 : -1,
      userId: users[Math.floor(Math.random() * users.length)].id,
      postId: randomBoolean()
        ? posts[Math.floor(Math.random() * posts.length)].id
        : null,
      commentId: randomBoolean()
        ? comments[Math.floor(Math.random() * comments.length)].id
        : null,
    }))
  );

  console.log('Dados falsos inseridos com sucesso.');
  process.exit();
})();
