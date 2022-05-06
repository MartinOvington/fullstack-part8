import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { BOOKS_BY_GENRE } from '../queries'
import BookTable from './BookTable'

const Books = (props) => {
  const [genre, setGenre] = useState(null)
  const result = useQuery(BOOKS_BY_GENRE, { variables: { genre } })
  const filterGenres = ['refactoring', 'agile', 'design', 'crime', 'classic']

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>
      {filterGenres.map((g) => (
        <button
          key={g}
          onClick={() => {
            setGenre(g)
            result.refetch({ genre: g })
          }}
        >
          {g}
        </button>
      ))}
      <button
        onClick={() => {
          setGenre(null)
          result.refetch({ genre: null })
        }}
      >
        all genres
      </button>
      {genre ? <p>books in {genre} genre:</p> : <p>books in all genres:</p>}
      <BookTable books={books} />
    </div>
  )
}

export default Books
