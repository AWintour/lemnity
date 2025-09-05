import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

const DashboardPage = (): ReactElement => {
  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>Protected area for admins.</p>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/widgets">Widgets</Link>
        <Link to="/cards/create">Create Card</Link>
      </nav>
    </div>
  )
}

export default DashboardPage
