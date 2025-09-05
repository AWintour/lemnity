import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

const LoginPage = (): ReactElement => {
  return (
    <div className="container">
      <h1>Login</h1>
      <p>Stub login page. Hook up to server auth later.</p>
      <Link to="/">Back</Link>
    </div>
  )
}

export default LoginPage
