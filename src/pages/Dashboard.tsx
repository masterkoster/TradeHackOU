import { clearSession } from '../auth/localAuth'
import { useSession } from '../auth/useSession'

const Dashboard = () => {
  const { session, setSession } = useSession()

  const handleSignOut = () => {
    clearSession()
    setSession(null)
  }

  return (
    <div className="page-shell">
      <div className="dash-card">
        <div>
          <p className="eyebrow">TradeHackOU</p>
          <h1>Dashboard</h1>
          <p className="subtle">Welcome back{session?.name ? `, ${session.name}` : ''}.</p>
          <p className="subtle">Charts and realtime data will live here.</p>
        </div>
        <button className="secondary" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Dashboard
