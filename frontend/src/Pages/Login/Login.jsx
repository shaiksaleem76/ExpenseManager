import { useState } from 'react'
import './Login.css'

function Login({ setIsLoggedIn, onRegister }) {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  const handleLogin = async (event) => {

    event.preventDefault()

    setError('')
    setLoading(true)

    try {

      const response = await fetch(
        'api/users/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      )


      const data = await response.json()


      if (!response.ok) {

        setError(
          data.message || 'Invalid email or password'
        )

        return
      }


      localStorage.setItem(
        'token',
        data.token
      )


      setIsLoggedIn(true)

    } catch (error) {

      console.error(error)

      setError(
        'Unable to connect to the server. Please try again.'
      )

    } finally {

      setLoading(false)
    }
  }


  return (

    <div className="login-page">


      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <section className="login-visual-section">


        {/* BRAND */}

        <div className="login-brand">

          <div className="login-brand-mark">
            ₹
          </div>

          <span>
            Expense Manager
          </span>

        </div>


        {/* VISUAL CONTENT */}

        <div className="login-visual-content">


          {/* BACKGROUND IMAGE */}

          <div className="login-3d-image-wrapper">

            <img
              src="/src/assets/expense-login.png"
              alt="Expense Manager"
              className="login-3d-image"
            />

          </div>


          {/* HERO TEXT */}

          <div className="login-visual-text">

            <span className="login-visual-eyebrow">
              SMART FINANCE MANAGEMENT
            </span>

            <h1>
              Take control
              <br />
              of your money.
            </h1>

            <p>
              Track your expenses, manage your budget,
              and understand your spending habits —
              all in one simple place.
            </p>

          </div>


        </div>


        {/* FOOTER */}

        <div className="login-visual-footer">

          <span>
            Simple. Clear. Smarter.
          </span>

          <span className="login-footer-dot">
            •
          </span>

          <span>
            Manage your money better.
          </span>

        </div>


      </section>



      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <section className="login-form-section">


        <div className="login-form-container">


          {/* MOBILE BRAND */}

          <div className="login-mobile-brand">

            <div className="login-brand-mark">
              ₹
            </div>

            <span>
              Expense Manager
            </span>

          </div>



          {/* LOGIN HEADER */}

          <div className="login-form-header">

            <span className="login-form-eyebrow">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your details below to continue
              managing your expenses.
            </p>

          </div>



          {/* ERROR MESSAGE */}

          {error && (

            <div className="login-error">

              <span className="login-error-icon">
                !
              </span>

              <span>
                {error}
              </span>

            </div>

          )}



          {/* LOGIN FORM */}

          <form
            className="login-form"
            onSubmit={handleLogin}
          >


            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="login-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">

                <span className="login-input-icon">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>

            </div>



            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">

                <span className="login-input-icon">
                  •••
                </span>


                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />


                {/* SHOW / HIDE PASSWORD */}

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >

                  {showPassword ? (

                    /* OPEN EYE */

                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >

                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />

                    </svg>

                  ) : (

                    /* CLOSED EYE */

                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >

                      <path
                        d="M3 3l18 18"
                      />

                      <path
                        d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                      />

                      <path
                        d="M9.9 4.3A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a16.4 16.4 0 0 1-3.1 4.4"
                      />

                      <path
                        d="M6.6 6.6C3.5 8.5 2 12 2 12s3.5 8 10 8c1.7 0 3.2-.4 4.5-1"
                      />

                    </svg>

                  )}

                </button>

              </div>

            </div>



            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="login-spinner"></span>

                  Signing in...
                </>

              ) : (

                <>
                  Sign in

                  <span className="login-button-arrow">
                    →
                  </span>
                </>

              )}

            </button>


          </form>



          {/* =================================================
              CREATE ACCOUNT
          ================================================= */}

          <div className="login-form-footer">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              className="create-account-button"
              onClick={onRegister}
            >

              Create an account

              <span>
                →
              </span>

            </button>

          </div>


        </div>


      </section>


    </div>
  )
}


export default Login