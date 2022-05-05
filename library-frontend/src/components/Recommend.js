import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import BookTable from './BookTable'

const Recommend = ({ show, genre }) => {
  const result = useQuery(ALL_BOOKS)
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
