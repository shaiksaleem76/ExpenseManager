import { useState } from 'react'
import './Register.css'

function Register({ onLogin, onRegisterSuccess }) {

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  const handleRegister = async (event) => {

    event.preventDefault()

    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {

      const response = await fetch(
        '/api/users/register',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            name: name,
            email: email,
            password: password
          })
        }
      )


      const data = await response.json()


      if (!response.ok) {

        setError(
          data.message || 'Unable to create account'
        )

        return
      }


      if (onRegisterSuccess) {
        onRegisterSuccess()
      } else if (onLogin) {
        onLogin()
      }

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

    <div className="register-page">


      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <section className="register-visual-section">


        {/* BRAND */}

        <div className="register-brand">

          <div className="register-brand-mark">
            ₹
          </div>

          <span>
            Expense Manager
          </span>

        </div>


        {/* VISUAL CONTENT */}

        <div className="register-visual-content">


          {/* BACKGROUND IMAGE */}

          <div className="register-3d-image-wrapper">

            <img
              src="/src/assets/expense-login.png"
              alt="Expense Manager"
              className="register-3d-image"
            />

          </div>


          {/* HERO TEXT */}

          <div className="register-visual-text">

            <span className="register-visual-eyebrow">
              JOIN THOUSANDS OF USERS
            </span>

            <h1>
              Start managing
              <br />
              your money today.
            </h1>

            <p>
              Create an account in seconds and get a clear,
              real-time picture of your income, expenses,
              and savings.
            </p>

          </div>


        </div>


        {/* FOOTER */}

        <div className="register-visual-footer">

          <span>
            Simple. Clear. Smarter.
          </span>

          <span className="register-footer-dot">
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

      <section className="register-form-section">


        <div className="register-form-container">


          {/* MOBILE BRAND */}

          <div className="register-mobile-brand">

            <div className="register-brand-mark">
              ₹
            </div>

            <span>
              Expense Manager
            </span>

          </div>



          {/* REGISTER HEADER */}

          <div className="register-form-header">

            <span className="register-form-eyebrow">
              CREATE ACCOUNT
            </span>

            <h2>
              Set up your account
            </h2>

            <p>
              Fill in your details below to start tracking
              your expenses.
            </p>

          </div>



          {/* ERROR MESSAGE */}

          {error && (

            <div className="register-error">

              <span className="register-error-icon">
                !
              </span>

              <span>
                {error}
              </span>

            </div>

          )}



          {/* REGISTER FORM */}

          <form
            className="register-form"
            onSubmit={handleRegister}
          >


            {/* =================================================
                NAME
            ================================================= */}

            <div className="register-field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

              </div>

            </div>



            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="register-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
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

            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>


                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  minLength={6}
                />


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
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>

                  ) : (

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
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a16.4 16.4 0 0 1-3.1 4.4" />
                      <path d="M6.6 6.6C3.5 8.5 2 12 2 12s3.5 8 10 8c1.7 0 3.2-.4 4.5-1" />
                    </svg>

                  )}

                </button>

              </div>

            </div>



            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div className="register-field">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>


                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                  minLength={6}
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >

                  {showConfirmPassword ? (

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
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>

                  ) : (

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
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a16.4 16.4 0 0 1-3.1 4.4" />
                      <path d="M6.6 6.6C3.5 8.5 2 12 2 12s3.5 8 10 8c1.7 0 3.2-.4 4.5-1" />
                    </svg>

                  )}

                </button>

              </div>

            </div>



            {/* =================================================
                REGISTER BUTTON
            ================================================= */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="register-spinner"></span>

                  Creating account...
                </>

              ) : (

                <>
                  Create account

                  <span className="register-button-arrow">
                    →
                  </span>
                </>

              )}

            </button>


          </form>



          {/* =================================================
              BACK TO LOGIN
          ================================================= */}

          <div className="register-form-footer">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              className="back-to-login-button"
              onClick={onLogin}
            >

              Sign in

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


export default Register