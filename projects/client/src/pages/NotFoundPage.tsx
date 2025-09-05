import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = (): ReactElement => {
  return (
    <div className="container">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Go Home</Link>
    </div>
  )
}

export default NotFoundPage
