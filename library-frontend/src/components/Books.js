import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import BookTable from './BookTable'

const Books = (props) => {
  const [genre, setGenre] = useState(null)
  const result = useQuery(ALL_BOOKS)
  const filterGenres = ['refactoring', 'agile', 'design', 'crime', 'classic']

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  const books = genre
    ? result.data.allBooks.filter((b) => b.genres.includes(genre))
    : result.data.allBooks

  return (
    <div>
      <h2>books</h2>
      {filterGenres.map((g) => (
        <button key={g} onClick={() => setGenre(g)}>
          {g}
        </button>
      ))}
      <button onClick={() => setGenre(null)}>all genres</button>
      {genre ? <p>books in {genre} genre:</p> : <p>books in all genres:</p>}
      <BookTable books={books} />
    </div>
  )
}

export default Books
