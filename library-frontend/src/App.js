import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import { ALL_AUTHORS, BOOK_ADDED, BOOKS_BY_GENRE } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [favGenre, setFavGenre] = useState(null)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`New book added: ${addedBook.title}`)

      client.cache.updateQuery(
        { query: BOOKS_BY_GENRE, variables: { genre: null } },
        ({ allBooks }) => {
          return {
            allBooks: allBooks.concat(addedBook),
          }
        }
      )
    },
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors show={page === 'authors'} loggedIn={token !== null} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Recommend show={page === 'recommend'} genre={favGenre} />

      <LoginForm
        show={page === 'login'}
        setError={() => null}
        setToken={setToken}
        setPage={setPage}
        setFavGenre={setFavGenre}
      />
    </div>
  )
}

export default App
