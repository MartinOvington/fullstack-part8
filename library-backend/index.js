require('dotenv').config()
const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const author = require('./models/author')

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

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type editAuthor {
    name: String!
    born: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): editAuthor
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author) {
        if (!args.genre) {
          return Book.find({})
        } else {
          return Book.find({ genres: args.genre })
        }
      } else {
        const authorId = await Author.find({ name: args.author })
        if (!args.genre) {
          return Book.find({ author: authorId })
        }
        return Book.find({ author: authorId, genres: args.genre })
      }
    },
    allAuthors: async () => Author.find({}),
  },
  Author: {
    bookCount: async (root) => Book.find({ author: root.id }).countDocuments(),
  },
  Book: {
    author: async (root) => Author.findById(root.author),
  },
  Mutation: {
    addBook: async (root, args) => {
      const authorObj = { name: args.author, born: null }
      const foundAuthor = await Author.findOne({ name: args.author })
      if (foundAuthor) {
        const book = new Book({ ...args, author: foundAuthor._id })
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.messge, {
            invalidArgs: args,
          })
        }
        return book
      } else {
        const author = new Author({ name: args.author, born: null })
        const book = new Book({ ...args, author: author.id })
        try {
          await book.save()
          await author.save()
        } catch (error) {
          throw new UserInputError(error.messge, {
            invalidArgs: args,
          })
        }
        return book
      }
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.messge, {
          invalidArgs: args,
        })
      }
      return {
        name: args.name,
        born: args.setBornTo,
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
