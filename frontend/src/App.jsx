import { useState } from 'react'
import './App.css'

import Sidebar from './Sidebar'
import Dashboard from './pages/Dashboard/Dashboard'
import Expenses from './pages/Expenses/Expenses'
import Budget from './pages/Budget/Budget'
import RecurringBills from './pages/Recurring Bills/RecurringBills'
import Analytics from './pages/Analytics/Analytics'
import Profile from './pages/Profile/Profile'
import Login from "./pages/Login/Login"
import Register from "./pages/Register/Register"

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token')
  )

  const [currentPage, setCurrentPage] = useState('dashboard')

  // 'login' or 'register' — controls which auth page shows
  const [authPage, setAuthPage] = useState('login')


  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setCurrentPage('dashboard')
  }


  if (!isLoggedIn) {

    if (authPage === 'register') {

      return (
        <Register
          onLogin={() => setAuthPage('login')}
          onRegisterSuccess={() => setAuthPage('login')}
        />
      )

    }

    return (
      <Login
        setIsLoggedIn={setIsLoggedIn}
        onRegister={() => setAuthPage('register')}
      />
    )

  }


  return (

    <div className="app">

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />


      <main className="main-content">

        {currentPage === 'dashboard' && (
          <Dashboard />
        )}


        {currentPage === 'expenses' && (
          <Expenses />
        )}
        {currentPage === 'budget' && (
          <Budget />
        )}
        {currentPage === 'recurring' && (
          <RecurringBills />
        )}
        {currentPage === 'analytics' && (
          <Analytics />
        )}
        {currentPage === 'profile' && (
          <Profile onLogout={handleLogout} />
        )}

      </main>

    </div>

  )
}

export default App