require('dotenv').config();
const { faker } = require('@faker-js/faker');
const sequelize = require('./src/database');

const { importModel } = require('./src/engine/sequelize/generateModel');

const { Client, User, Tag, Post, Comment, Vote } = importModel();

const CLIENTS_COUNT = 50;
const USERS_COUNT = 20;
const POSTS_COUNT = 50;
const COMMENTS_COUNT = 100;
const TAGS_COUNT = 10;

(async () => {
  await sequelize.sync({ force: true });

  // Criar clientes
  const clients = await Client.bulkCreate(
    [...Array(CLIENTS_COUNT)].map(() => ({
      name: faker.company.name(),
    }))
  );

  // Criar usuários
  const users = await User.bulkCreate(
    [...Array(USERS_COUNT)].map(() => ({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      client_id: clients[Math.floor(Math.random() * clients.length)].id,
    }))
  );

  // Criar tags
  const tags = await Tag.bulkCreate(
    [...Array(TAGS_COUNT)].map(() => ({
      name: faker.lorem.word(),
      client_id: clients[Math.floor(Math.random() * clients.length)].id,
    }))
  );

  // Criar posts
  const posts = await Post.bulkCreate(
    [...Array(POSTS_COUNT)].map(() => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      user_id: users[Math.floor(Math.random() * users.length)].id,
      tag_id: tags[Math.floor(Math.random() * tags.length)].id,
    }))
  );

  // Criar comentários
  const comments = await Comment.bulkCreate(
    [...Array(COMMENTS_COUNT)].map(() => ({
      text: faker.lorem.paragraph(),
      user_id: users[Math.floor(Math.random() * users.length)].id,
      post_id: posts[Math.floor(Math.random() * posts.length)].id,
    }))
  );

  function randomBoolean() {
    return Math.random() >= 0.5;
  }

  // Criar votos
  await Vote.bulkCreate(
    [...Array(POSTS_COUNT + COMMENTS_COUNT)].map(() => ({
      type: randomBoolean() ? 1 : -1,
      user_id: users[Math.floor(Math.random() * users.length)].id,
      post_id: randomBoolean()
        ? posts[Math.floor(Math.random() * posts.length)].id
        : null,
      comment_id: randomBoolean()
        ? comments[Math.floor(Math.random() * comments.length)].id
        : null,
    }))
  );

  console.log('Dados falsos inseridos com sucesso.');
  process.exit();
})();
