import { useEffect, useState } from 'react'
import './Profile.css'

function Profile({ onLogout }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const token = localStorage.getItem('token')

        const response = await fetch(
          '/api/users/me',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to load profile')
        }

        const data = await response.json()

        setUser(data)

      } catch (error) {

        console.error(error)
        setError('Unable to load your profile.')

      } finally {

        setLoading(false)
      }

    }

    fetchProfile()

  }, [])


  if (loading) {
    return <p className="profile-loading">Loading profile...</p>
  }

  if (error) {
    return <p className="profile-error">{error}</p>
  }


  return (

    <div className="profile-page">

      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account details</p>
      </div>


      <div className="profile-card">

        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase() || '?'}
        </div>

        <div className="profile-details">

          <div className="profile-field">
            <span className="profile-label">Name</span>
            <span className="profile-value">{user?.name}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user?.email}</span>
          </div>

        </div>

      </div>


      <button
        className="profile-logout-button"
        onClick={onLogout}
      >
        Log out
      </button>

    </div>

  )
}

export default Profile