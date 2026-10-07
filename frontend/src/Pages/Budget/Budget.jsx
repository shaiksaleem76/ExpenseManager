import { useEffect, useState } from 'react'
import './Budget.css'

const API_URL = 'http://localhost:8080/api/budgets'

const categories = [
  { name: 'Food', icon: '🍔' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Bills', icon: '💡' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Others', icon: '•••' }
]

const months = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
]

function Budget() {

  const today = new Date()

  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  const [budgets, setBudgets] = useState([])
  const [budgetSummaries, setBudgetSummaries] = useState({})

  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [editingBudget, setEditingBudget] = useState(null)
  const [selectedSummary, setSelectedSummary] = useState(null)
  const [deletingBudget, setDeletingBudget] = useState(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    month: currentMonth,
    year: currentYear
  })

  const token = localStorage.getItem('token')

  const currentMonthName =
    months.find(month => month.value === currentMonth)?.name || ''

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {

    const amount = Number(value || 0)

    return `₹${amount.toLocaleString('en-IN', {
      maximumFractionDigits: 2
    })}`
  }

  // =========================================================
  // GET MONTH NAME
  // =========================================================

  const getMonthName = (monthNumber) => {

    return (
      months.find(
        month => month.value === Number(monthNumber)
      )?.name || ''
    )
  }

  // =========================================================
  // GET CATEGORY ICON
  // =========================================================

  const getCategoryIcon = (categoryName) => {

    return (
      categories.find(
        category => category.name === categoryName
      )?.icon || '•••'
    )
  }

  // =========================================================
  // GET ALL BUDGETS
  // =========================================================

  const fetchBudgets = async () => {

    try {

      setLoading(true)
      setError('')

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load budgets')
      }

      const data = await response.json()

      setBudgets(data)

      // Only current month budgets are displayed
      const currentBudgets = data.filter(
        budget =>
          Number(budget.month) === currentMonth &&
          Number(budget.year) === currentYear
      )

      // Fetch summary for every current month category
      await fetchAllSummaries(currentBudgets)

    } catch (err) {

      setError(
        err.message || 'Something went wrong'
      )

    } finally {

      setLoading(false)

    }
  }

  // =========================================================
  // GET SUMMARY FOR ALL CURRENT MONTH BUDGETS
  // =========================================================

  const fetchAllSummaries = async (currentBudgets) => {

    if (!currentBudgets.length) {

      setBudgetSummaries({})

      return
    }

    try {

      setSummaryLoading(true)

      const summaryResults = {}

      await Promise.all(
        currentBudgets.map(async budget => {

          try {

            const response = await fetch(
              `${API_URL}/${budget.id}/summary`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )

            if (!response.ok) {
              return
            }

            const data = await response.json()

            summaryResults[budget.id] = data

          } catch {
            // Keep other category summaries working
          }

        })
      )

      setBudgetSummaries(summaryResults)

    } finally {

      setSummaryLoading(false)

    }
  }

  // =========================================================
  // LOAD BUDGETS
  // =========================================================

  useEffect(() => {

    fetchBudgets()

  }, [])

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {

    const { name, value } = event.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = (categoryName = 'Food') => {

    setEditingBudget(null)

    setForm({
      amount: '',
      category: categoryName,
      month: currentMonth,
      year: currentYear
    })

    setError('')
    setShowModal(true)
  }

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (budget) => {

    setEditingBudget(budget)

    setForm({
      amount: budget.amount ?? '',
      category: budget.category || 'Food',
      month: budget.month,
      year: budget.year
    })

    setError('')
    setShowModal(true)
  }

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {

    if (saving) return

    setShowModal(false)
    setEditingBudget(null)
    setError('')
  }

  // =========================================================
  // SAVE / UPDATE BUDGET
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault()

    if (!form.amount || Number(form.amount) <= 0) {

      setError(
        'Please enter a valid budget amount'
      )

      return
    }

    // Prevent duplicate category budget
    if (!editingBudget) {

      const duplicateBudget = budgets.find(
        budget =>
          Number(budget.month) === Number(form.month) &&
          Number(budget.year) === Number(form.year) &&
          budget.category === form.category
      )

      if (duplicateBudget) {

        setError(
          `${form.category} budget already exists for ${getMonthName(form.month)} ${form.year}. Please edit the existing budget instead.`
        )

        return
      }
    }

    try {

      setSaving(true)
      setError('')

      const payload = {
        amount: Number(form.amount),
        category: form.category,
        month: Number(form.month),
        year: Number(form.year)
      }

      const url = editingBudget
        ? `${API_URL}/${editingBudget.id}`
        : API_URL

      const method = editingBudget
        ? 'PUT'
        : 'POST'

      const response = await fetch(url, {

        method,

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify(payload)

      })

      if (!response.ok) {

        let message = 'Failed to save budget'

        try {

          const errorData =
            await response.json()

          message =
            errorData.message ||
            errorData.error ||
            message

        } catch {
          // Keep default message
        }

        throw new Error(message)
      }

      setShowModal(false)
      setEditingBudget(null)

      await fetchBudgets()

    } catch (err) {

      setError(
        err.message ||
        'Failed to save budget'
      )

    } finally {

      setSaving(false)

    }
  }

  // =========================================================
  // OPEN DELETE CONFIRMATION
  // =========================================================

  const openDeleteConfirm = (budget) => {

    setDeletingBudget(budget)
    setShowDeleteConfirm(true)
    setError('')
  }

  // =========================================================
  // CLOSE DELETE CONFIRMATION
  // =========================================================

  const closeDeleteConfirm = () => {

    if (deleting) return

    setShowDeleteConfirm(false)
    setDeletingBudget(null)
  }

  // =========================================================
  // DELETE BUDGET
  // =========================================================

  const handleDelete = async () => {

    if (!deletingBudget) return

    try {

      setDeleting(true)
      setError('')

      const response = await fetch(
        `${API_URL}/${deletingBudget.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {

        let message = 'Failed to delete budget'

        try {

          const errorData =
            await response.json()

          message =
            errorData.message ||
            errorData.error ||
            message

        } catch {
          // Keep default message
        }

        throw new Error(message)
      }

      setShowDeleteConfirm(false)
      setDeletingBudget(null)

      await fetchBudgets()

    } catch (err) {

      setError(
        err.message ||
        'Failed to delete budget'
      )

    } finally {

      setDeleting(false)

    }
  }

  // =========================================================
  // VIEW CATEGORY SUMMARY
  // =========================================================

  const handleViewSummary = async (budget) => {

    try {

      setSummaryLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/${budget.id}/summary`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {

        let message =
          'Failed to load budget summary'

        try {

          const errorData =
            await response.json()

          message =
            errorData.message ||
            errorData.error ||
            message

        } catch {
          // Keep default message
        }

        throw new Error(message)
      }

      const data = await response.json()

      setSelectedSummary(data)
      setShowSummary(true)

      setBudgetSummaries(prev => ({
        ...prev,
        [budget.id]: data
      }))

    } catch (err) {

      setError(
        err.message ||
        'Failed to load summary'
      )

    } finally {

      setSummaryLoading(false)

    }
  }

  // =========================================================
  // GET SUMMARY VALUES
  // =========================================================

  const getSummaryForBudget = (budget) => {

    return budgetSummaries[budget.id] || null
  }

  // =========================================================
  // GET PROGRESS
  // =========================================================

  const getProgress = (budget) => {

    const summary =
      getSummaryForBudget(budget)

    if (
      !summary ||
      !summary.amount ||
      Number(summary.amount) <= 0
    ) {
      return 0
    }

    const progress =
      (
        Number(summary.spent || 0) /
        Number(summary.amount)
      ) * 100

    return Math.min(
      Math.max(progress, 0),
      100
    )
  }

  // =========================================================
  // GET STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {

    if (!status) {
      return 'budget-status neutral'
    }

    const normalized =
      status.toUpperCase()

    if (normalized.includes('OVER')) {
      return 'budget-status danger'
    }

    if (
      normalized.includes('NEAR') ||
      normalized.includes('LIMIT')
    ) {
      return 'budget-status warning'
    }

    if (
      normalized.includes('WITHIN')
    ) {
      return 'budget-status success'
    }

    return 'budget-status neutral'
  }

  // =========================================================
  // CURRENT MONTH BUDGETS
  // =========================================================

  const currentBudgets = budgets.filter(
    budget =>
      Number(budget.month) === currentMonth &&
      Number(budget.year) === currentYear
  )

  // =========================================================
  // SUMMARY TOTALS
  // =========================================================

  const totalBudget =
    currentBudgets.reduce(
      (total, budget) =>
        total + Number(budget.amount || 0),
      0
    )

  const totalSpent =
    currentBudgets.reduce(
      (total, budget) => {

        const summary =
          getSummaryForBudget(budget)

        return (
          total +
          Number(summary?.spent || 0)
        )

      },
      0
    )

  const totalRemaining =
    currentBudgets.reduce(
      (total, budget) => {

        const summary =
          getSummaryForBudget(budget)

        if (summary) {
          return (
            total +
            Number(summary.remaining || 0)
          )
        }

        return (
          total +
          Number(budget.amount || 0)
        )

      },
      0
    )

  const totalProgress =
    totalBudget > 0
      ? Math.min(
          Math.max(
            (totalSpent / totalBudget) * 100,
            0
          ),
          100
        )
      : 0

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="budget-page">

        <div className="budget-loading">

          <div className="budget-loading-spinner"></div>

          <p>
            Loading your budgets...
          </p>

        </div>

      </div>

    )
  }

  return (

    <div className="budget-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="budget-page-header">

        <div>

          <div className="budget-eyebrow">
            FINANCIAL PLANNING
          </div>

          <h1>
            Category Budgets
          </h1>

          <p>
            Set spending limits for each category
            and keep your expenses under control.
          </p>

        </div>

        <button
          className="budget-add-button"
          onClick={() => openAddModal()}
        >
          <span>+</span>
          Add Budget
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error &&
        !showModal &&
        !showDeleteConfirm && (
          <div className="budget-error-banner">

            <span>!</span>

            {error}

          </div>
        )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="budget-summary-grid">

        {/* TOTAL BUDGET */}

        <div className="budget-summary-card">

          <div className="budget-summary-top">

            <span className="budget-summary-label">
              TOTAL BUDGET
            </span>

            <div className="budget-summary-icon budget-icon-blue">
              ₹
            </div>

          </div>

          <div className="budget-summary-value">
            {formatCurrency(totalBudget)}
          </div>

          <div className="budget-summary-subtext">
            {currentBudgets.length > 0
              ? `${currentBudgets.length} category budget${currentBudgets.length > 1 ? 's' : ''}`
              : 'No budgets set'}
          </div>

        </div>

        {/* TOTAL SPENT */}

        <div className="budget-summary-card">

          <div className="budget-summary-top">

            <span className="budget-summary-label">
              TOTAL SPENT
            </span>

            <div className="budget-summary-icon budget-icon-orange">
              ↗
            </div>

          </div>

          <div className="budget-summary-value">
            {formatCurrency(totalSpent)}
          </div>

          <div className="budget-summary-subtext">
            {totalProgress.toFixed(1)}% of category budgets
          </div>

        </div>

        {/* TOTAL REMAINING */}

        <div className="budget-summary-card">

          <div className="budget-summary-top">

            <span className="budget-summary-label">
              TOTAL REMAINING
            </span>

            <div className="budget-summary-icon budget-icon-green">
              ✓
            </div>

          </div>

          <div className="budget-summary-value">
            {formatCurrency(totalRemaining)}
          </div>

          <div className="budget-summary-subtext">
            {totalRemaining >= 0
              ? 'Available'
              : 'Over budget'}
          </div>

        </div>

      </div>

      {/* =====================================================
          CURRENT MONTH
      ===================================================== */}

      <div className="budget-section-heading">

        <div>

          <h2>
            Current Month
          </h2>

          <p>
            Category-wise spending limits for this month.
          </p>

        </div>

        <span className="budget-current-month">
          {currentMonthName} {currentYear}
        </span>

      </div>

      {/* =====================================================
          CATEGORY GRID
      ===================================================== */}

      <div className="budget-category-list">

        {categories.map(category => {

          const budget =
            currentBudgets.find(
              item =>
                item.category === category.name
            )

          // No budget configured
          if (!budget) {

            return (

              <div
                className="budget-category-budget-card not-configured"
                key={category.name}
              >

                <div className="category-card-top">

                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <div className="category-title-area">

                    <h3>
                      {category.name}
                    </h3>

                    <span>
                      Not configured
                    </span>

                  </div>

                </div>

                <div className="category-not-configured">

                  <p>
                    No budget has been set for this
                    category.
                  </p>

                  <button
                    className="budget-secondary-button"
                    onClick={() =>
                      openAddModal(category.name)
                    }
                  >
                    + Add Budget
                  </button>

                </div>

              </div>

            )
          }

          const summary =
            getSummaryForBudget(budget)

          const progress =
            getProgress(budget)

          const spent =
            Number(summary?.spent || 0)

          const remaining =
            summary
              ? Number(summary.remaining || 0)
              : Number(budget.amount || 0)

          return (

            <div
              className="budget-category-budget-card"
              key={budget.id}
            >

              {/* CATEGORY HEADER */}

              <div className="category-card-top">

                <div className="category-icon">
                  {category.icon}
                </div>

                <div className="category-title-area">

                  <h3>
                    {category.name}
                  </h3>

                  {summary && (
                    <div
                      className={getStatusClass(
                        summary.status
                      )}
                    >
                      <span className="status-dot"></span>
                      {summary.status}
                    </div>
                  )}

                </div>

              </div>

              {/* BUDGET AMOUNT */}

              <div className="category-budget-amount">

                {formatCurrency(budget.amount)}

                <span>
                  Budget
                </span>

              </div>

              {/* SPENDING DETAILS */}

              <div className="category-spending-row">

                <div>

                  <span>
                    SPENT
                  </span>

                  <strong>
                    {formatCurrency(spent)}
                  </strong>

                </div>

                <div>

                  <span>
                    REMAINING
                  </span>

                  <strong
                    className={
                      remaining < 0
                        ? 'remaining-negative'
                        : 'remaining-positive'
                    }
                  >
                    {formatCurrency(remaining)}
                  </strong>

                </div>

              </div>

              {/* PROGRESS */}

              <div className="category-progress-section">

                <div className="budget-progress-header">

                  <span>
                    Budget usage
                  </span>

                  <strong>
                    {progress.toFixed(1)}%
                  </strong>

                </div>

                <div className="budget-progress-track">

                  <div
                    className={`budget-progress-fill ${
                      progress >= 100
                        ? 'progress-danger'
                        : progress >= 80
                          ? 'progress-warning'
                          : 'progress-normal'
                    }`}
                    style={{
                      width: `${progress}%`
                    }}
                  ></div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="category-card-actions">

                <button
                  className="budget-secondary-button"
                  onClick={() =>
                    handleViewSummary(budget)
                  }
                  disabled={summaryLoading}
                >
                  View Summary
                </button>

                <button
                  className="budget-edit-button"
                  onClick={() =>
                    openEditModal(budget)
                  }
                >
                  Edit
                </button>

                <button
                  className="budget-delete-button"
                  onClick={() =>
                    openDeleteConfirm(budget)
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          )

        })}

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="budget-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeModal()
            }

          }}
        >

          <div className="budget-modal">

            <div className="budget-modal-header">

              <div>

                <div className="budget-modal-eyebrow">

                  {editingBudget
                    ? 'UPDATE BUDGET'
                    : 'CATEGORY BUDGET'}

                </div>

                <h2>

                  {editingBudget
                    ? 'Edit Category Budget'
                    : 'Add Category Budget'}

                </h2>

                <p>

                  {editingBudget
                    ? 'Update the spending limit for this category.'
                    : 'Set a monthly spending limit for a category.'}

                </p>

              </div>

              <button
                className="budget-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              className="budget-form"
              onSubmit={handleSubmit}
            >

              {/* MONTH */}

              <div className="budget-form-group">

                <label>
                  MONTH
                </label>

                <select
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  className="budget-input"
                  disabled={saving}
                >

                  {months.map(month => (

                    <option
                      key={month.value}
                      value={month.value}
                    >
                      {month.name}
                    </option>

                  ))}

                </select>

              </div>

              {/* YEAR */}

              <div className="budget-form-group">

                <label>
                  YEAR
                </label>

                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="budget-input"
                  disabled={saving}
                >

                  {Array.from(
                    { length: 5 },
                    (_, index) =>
                      currentYear - 2 + index
                  ).map(year => (

                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>

                  ))}

                </select>

              </div>

              {/* CATEGORY */}

              <div className="budget-form-group">

                <label>
                  CATEGORY
                </label>

                <div className="budget-category-grid">

                  {categories.map(category => (

                    <button
                      type="button"
                      key={category.name}
                      className={
                        form.category === category.name
                          ? 'budget-category-card selected'
                          : 'budget-category-card'
                      }
                      onClick={() =>
                        setForm(prev => ({
                          ...prev,
                          category: category.name
                        }))
                      }
                      disabled={saving}
                    >

                      <span>
                        {category.icon}
                      </span>

                      <small>
                        {category.name}
                      </small>

                    </button>

                  ))}

                </div>

              </div>

              {/* AMOUNT */}

              <div className="budget-form-group">

                <label>
                  BUDGET AMOUNT
                </label>

                <div className="budget-amount-input-wrapper">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    className="budget-amount-input"
                    disabled={saving}
                    required
                  />

                </div>

              </div>

              {error && (

                <div className="budget-form-error">

                  <span>
                    !
                  </span>

                  {error}

                </div>

              )}

              <div className="budget-modal-footer">

                <button
                  type="button"
                  className="budget-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="budget-save-button"
                  disabled={saving}
                >

                  {saving && (
                    <span className="budget-spinner"></span>
                  )}

                  {saving
                    ? 'Saving...'
                    : editingBudget
                      ? 'Save Changes'
                      : 'Save Budget'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          SUMMARY MODAL
      ===================================================== */}

      {showSummary && selectedSummary && (

        <div
          className="budget-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget
            ) {
              setShowSummary(false)
            }

          }}
        >

          <div className="budget-summary-modal">

            <div className="budget-modal-header">

              <div>

                <div className="budget-modal-eyebrow">
                  BUDGET SUMMARY
                </div>

                <h2>

                  {selectedSummary.category || 'Category'}{' '}
                  ·{' '}
                  {getMonthName(
                    selectedSummary.month
                  )}{' '}
                  {selectedSummary.year}

                </h2>

                <p>
                  Detailed spending information
                  for this category.
                </p>

              </div>

              <button
                className="budget-modal-close"
                onClick={() =>
                  setShowSummary(false)
                }
              >
                ×
              </button>

            </div>

            <div className="budget-detail-grid">

              <div className="budget-detail-card">

                <span>
                  BUDGET
                </span>

                <strong>
                  {formatCurrency(
                    selectedSummary.amount
                  )}
                </strong>

              </div>

              <div className="budget-detail-card">

                <span>
                  SPENT
                </span>

                <strong>
                  {formatCurrency(
                    selectedSummary.spent
                  )}
                </strong>

              </div>

              <div className="budget-detail-card">

                <span>
                  REMAINING
                </span>

                <strong
                  className={
                    Number(
                      selectedSummary.remaining
                    ) < 0
                      ? 'detail-danger'
                      : 'detail-success'
                  }
                >
                  {formatCurrency(
                    selectedSummary.remaining
                  )}
                </strong>

              </div>

              <div className="budget-detail-card">

                <span>
                  CATEGORY
                </span>

                <strong>
                  {selectedSummary.category ||
                    'Category'}
                </strong>

              </div>

            </div>

            <div className="budget-summary-progress">

              <div className="budget-progress-header">

                <span>
                  Budget usage
                </span>

                <strong>

                  {selectedSummary.amount
                    ? (
                        Number(
                          selectedSummary.spent || 0
                        ) /
                        Number(
                          selectedSummary.amount
                        ) *
                        100
                      )
                        .toFixed(1)
                    : '0.0'}%

                </strong>

              </div>

              <div className="budget-progress-track">

                <div
                  className={`budget-progress-fill ${
                    Number(
                      selectedSummary.spent || 0
                    ) >=
                    Number(
                      selectedSummary.amount || 0
                    )
                      ? 'progress-danger'
                      : Number(
                          selectedSummary.spent || 0
                        ) /
                          Number(
                            selectedSummary.amount || 1
                          ) >=
                        0.8
                        ? 'progress-warning'
                        : 'progress-normal'
                  }`}
                  style={{
                    width: `${
                      selectedSummary.amount
                        ? Math.min(
                            (
                              Number(
                                selectedSummary.spent || 0
                              ) /
                              Number(
                                selectedSummary.amount
                              )
                            ) * 100,
                            100
                          )
                        : 0
                    }%`
                  }}
                ></div>

              </div>

            </div>

            <div className="budget-summary-message">

              <div className="summary-message-icon">

                {Number(
                  selectedSummary.remaining
                ) >= 0
                  ? '✓'
                  : '!'}

              </div>

              <div>

                <strong>
                  {selectedSummary.status}
                </strong>

                <p>

                  {Number(
                    selectedSummary.remaining
                  ) >= 0

                    ? `You have ${formatCurrency(
                        selectedSummary.remaining
                      )} remaining for ${selectedSummary.category}.`

                    : `You have exceeded the ${selectedSummary.category} budget by ${formatCurrency(
                        Math.abs(
                          Number(
                            selectedSummary.remaining
                          )
                        )
                      )}.`}

                </p>

              </div>

            </div>

            <div className="budget-summary-footer">

              <button
                className="budget-cancel-button"
                onClick={() =>
                  setShowSummary(false)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {showDeleteConfirm &&
        deletingBudget && (

          <div
            className="budget-modal-overlay"
            onMouseDown={(event) => {

              if (
                event.target === event.currentTarget &&
                !deleting
              ) {
                closeDeleteConfirm()
              }

            }}
          >

            <div className="budget-delete-modal">

              <div className="delete-warning-icon">
                !
              </div>

              <h2>
                Delete this budget?
              </h2>

              <p>

                You're about to delete the{' '}

                <strong>
                  {deletingBudget.category}
                </strong>{' '}

                budget for{' '}

                <strong>
                  {getMonthName(
                    deletingBudget.month
                  )}{' '}
                  {deletingBudget.year}
                </strong>{' '}.

              </p>

              <p className="delete-warning-text">
                This action cannot be undone.
              </p>

              <div className="budget-delete-footer">

                <button
                  className="budget-cancel-button"
                  onClick={closeDeleteConfirm}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  className="budget-confirm-delete-button"
                  onClick={handleDelete}
                  disabled={deleting}
                >

                  {deleting && (
                    <span className="budget-spinner"></span>
                  )}

                  {deleting
                    ? 'Deleting...'
                    : 'Delete Budget'}

                </button>

              </div>

            </div>

          </div>

        )}

    </div>

  )
}

export default Budget