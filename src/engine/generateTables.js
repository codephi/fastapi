require('dotenv').config()
const { sequelize } = require('./database')
// eslint-disable-next-line no-unused-vars
const Client = require('./models/Client')
// eslint-disable-next-line no-unused-vars
const User = require('./models/User')
// eslint-disable-next-line no-unused-vars
const Post = require('./models/Post')
// eslint-disable-next-line no-unused-vars
const Tag = require('./models/Tag')
// eslint-disable-next-line no-unused-vars
const Comment = require('./models/Comment')
// eslint-disable-next-line no-unused-vars
const Vote = require('./models/Vote')

const createTables = async () => {
  try {
    await sequelize.sync({ force: true })
    console.log('All tables created.')
  } catch (error) {
    console.error('Error creating tables:', error)
  } finally {
    await sequelize.close()
  }
}

createTables()
