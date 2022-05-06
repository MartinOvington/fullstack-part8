import { useQuery } from '@apollo/client'
import { BOOKS_BY_GENRE } from '../queries'
import BookTable from './BookTable'

const Recommend = ({ show, genre }) => {
  const result = useQuery(BOOKS_BY_GENRE, { variables: { genre } })
  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  const books = result.data.allBooks.filter((b) => b.genres.includes(genre))

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre {genre}</p>
      <BookTable books={books} />
    </div>
  )
}

export default Recommend
