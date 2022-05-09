require('dotenv').config()
const {
  ApolloServer,
  UserInputError,
  gql,
  AuthenticationError,
} = require('apollo-server')
const { v1: uuid } = require('uuid')
const User = require('./models/user')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const MONGODB_URI = process.env.MONGODB_URI
const SECRET = process.env.SECRET

console.log('Connecting to MongoDB')

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to mongoDB:', error.message)
  })

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
