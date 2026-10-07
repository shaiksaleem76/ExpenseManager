import './Sidebar.css'

function Sidebar({ setCurrentPage, currentPage, onLogout }) {

  return (
    <aside className="sidebar">

      {/* SIDEBAR LOGO */}

      <div className="sidebar-logo">

        <h2>Expense</h2>
        <h2>Manager</h2>

      </div>


      {/* SIDEBAR NAVIGATION */}

      <nav className="sidebar-nav">


        {/* DASHBOARD */}

        <button
          className={
            currentPage === 'dashboard'
              ? 'nav-item active'
              : 'nav-item'
          }
          onClick={() =>
            setCurrentPage('dashboard')
          }
        >

          <span>▦</span>

          Dashboard

        </button>


        {/* EXPENSES */}

        <button
          className={
            currentPage === 'expenses'
              ? 'nav-item active'
              : 'nav-item'
          }
          onClick={() =>
            setCurrentPage('expenses')
          }
        >

          <span>₹</span>

          Expenses

        </button>


        {/* BUDGET */}

        <button
          className={
            currentPage === 'budget'
              ? 'nav-item active'
              : 'nav-item'
          }
          onClick={() =>
            setCurrentPage('budget')
          }
        >

          <span>◈</span>

          Budget

        </button>


        {/* RECURRING BILLS */}

        <button
          className={
            currentPage === 'recurring'
              ? 'nav-item active'
              : 'nav-item'
          }
          onClick={() =>
            setCurrentPage('recurring')
          }
        >

          <span>↻</span>

          Recurring Bills

        </button>


        {/* ANALYTICS */}

        <button
          className={
            currentPage === 'analytics'
              ? 'nav-item active'
              : 'nav-item'
          }
          onClick={() =>
            setCurrentPage('analytics')
          }
        >

          <span>◒</span>

          Analytics

        </button>


        {/* PROFILE */}

        <button
          className={
            currentPage === 'profile'
              ? 'nav-item active'
              : 'nav-item'
          }
          onClick={() =>
            setCurrentPage('profile')
          }
        >

          <span>◉</span>

          Profile

        </button>


      </nav>


      {/* SIDEBAR FOOTER — LOGOUT */}

      <div className="sidebar-footer">

        <button
          className="nav-item logout-item"
          onClick={onLogout}
        >

          <span>⏻</span>

          Logout

        </button>

      </div>

    </aside>
  )
}

export default Sidebar