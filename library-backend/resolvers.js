require('dotenv').config()
const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const SECRET = process.env.SECRET
const PASSWORD = process.env.PASSWORD

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
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async (root) => Book.find({ author: root.id }).countDocuments(),
  },
  Book: {
    author: async (root) => Author.findById(root.author),
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError('not authenticated')
      }
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
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError('not authenticated')
      }
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
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })
      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.messge, {
          invalidArgs: args,
        })
      }
      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== PASSWORD) {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return {
        value: jwt.sign(userForToken, SECRET),
        genre: user.favoriteGenre,
      }
    },
  },
}

module.exports = resolvers