import { useEffect, useState } from 'react'
import './Expenses.css'

function Expenses() {

  // ========================================
  // EXPENSE DATA
  // ========================================

  const [expenses, setExpenses] = useState([])


  // ========================================
  // ADD / EDIT FORM
  // ========================================

  const [showAddForm, setShowAddForm] =
    useState(false)

  const [editingExpenseId, setEditingExpenseId] =
    useState(null)

  const [title, setTitle] =
    useState('')

  const [amount, setAmount] =
    useState('')

  const [category, setCategory] =
    useState('')

  const [date, setDate] =
    useState('')

  const [description, setDescription] =
    useState('')


  // ========================================
  // SAVE / DELETE STATUS
  // ========================================

  const [isSaving, setIsSaving] =
    useState(false)

  const [deletingExpenseId, setDeletingExpenseId] =
    useState(null)

  const [saveError, setSaveError] =
    useState('')


  // ========================================
  // DELETE CONFIRMATION
  // ========================================

  const [expenseToDelete, setExpenseToDelete] =
    useState(null)


  // ========================================
  // REFRESH EXPENSE LIST
  // ========================================

  const [refreshExpenses, setRefreshExpenses] =
    useState(0)


  // ========================================
  // FILTERS
  // ========================================

  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  )

  const [year, setYear] = useState(
    new Date().getFullYear()
  )

  const [search, setSearch] =
    useState('')


  // ========================================
  // PAGINATION
  // ========================================

  const [page, setPage] =
    useState(0)

  const [totalPages, setTotalPages] =
    useState(0)


  // ========================================
  // SORTING
  // ========================================

  const [sortBy, setSortBy] =
    useState('date')

  const [direction, setDirection] =
    useState('desc')


  // ========================================
  // CATEGORY CONFIG
  // ========================================

  const categories = [
    {
      name: 'Food',
      icon: '🍔'
    },
    {
      name: 'Travel',
      icon: '✈️'
    },
    {
      name: 'Shopping',
      icon: '🛍️'
    },
    {
      name: 'Bills',
      icon: '💡'
    },
    {
      name: 'Entertainment',
      icon: '🎬'
    },
    {
      name: 'Others',
      icon: '•••'
    }
  ]


  // ========================================
  // RESET PAGE WHEN FILTERS CHANGE
  // ========================================

  useEffect(() => {

    setPage(0)

  }, [
    month,
    year,
    search,
    sortBy,
    direction
  ])


  // ========================================
  // FETCH EXPENSES
  // ========================================

  useEffect(() => {

    const fetchExpenses = async () => {

      try {

        const token =
          localStorage.getItem('token')


        const response = await fetch(
          `/api/expenses?month=${month}&year=${year}&page=${page}&size=10&sortBy=${sortBy}&direction=${direction}&search=${encodeURIComponent(search)}`,
          {
            method: 'GET',

            headers: {
              'Authorization':
                `Bearer ${token}`
            }
          }
        )


        if (!response.ok) {

          console.error(
            'Failed to fetch expenses:',
            response.status
          )

          return
        }


        const data =
          await response.json()


        console.log(
          'Expenses response:',
          data
        )


        if (data.content) {

          setExpenses(
            data.content
          )

          setTotalPages(
            data.totalPages
          )

        } else {

          setExpenses([])

          setTotalPages(0)

        }

      } catch (error) {

        console.error(
          'Error fetching expenses:',
          error
        )

      }

    }


    fetchExpenses()

  }, [
    month,
    year,
    search,
    sortBy,
    direction,
    page,
    refreshExpenses
  ])


  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {

    setTitle('')

    setAmount('')

    setCategory('')

    setDate('')

    setDescription('')

    setEditingExpenseId(null)

    setSaveError('')

  }


  // ========================================
  // OPEN ADD EXPENSE FORM
  // ========================================

  const handleOpenAddForm = () => {

    resetForm()

    const today =
      new Date()
        .toISOString()
        .split('T')[0]

    setDate(today)

    setShowAddForm(true)

  }


  // ========================================
  // OPEN EDIT EXPENSE FORM
  // ========================================

  const handleEditExpense = (expense) => {

    setSaveError('')

    setEditingExpenseId(
      expense.id
    )

    setTitle(
      expense.title || ''
    )

    setAmount(
      expense.amount || ''
    )

    setCategory(
      expense.category || ''
    )

    setDate(
      expense.date || ''
    )

    setDescription(
      expense.description || ''
    )

    setShowAddForm(true)

  }


  // ========================================
  // CLOSE ADD / EDIT FORM
  // ========================================

  const handleCloseForm = () => {

    if (isSaving) {
      return
    }

    resetForm()

    setShowAddForm(false)

  }


  // ========================================
  // SAVE / UPDATE EXPENSE
  // ========================================

  const handleSaveExpense = async () => {

    setSaveError('')


    // ========================================
    // BASIC VALIDATION
    // ========================================

    if (!title.trim()) {

      setSaveError(
        'Please enter an expense title.'
      )

      return
    }


    if (!amount || Number(amount) <= 0) {

      setSaveError(
        'Please enter a valid amount.'
      )

      return
    }


    if (!category) {

      setSaveError(
        'Please select a category.'
      )

      return
    }


    if (!date) {

      setSaveError(
        'Please select a date.'
      )

      return
    }


    // ========================================
    // GET JWT
    // ========================================

    const token =
      localStorage.getItem('token')


    if (!token) {

      setSaveError(
        'You are not logged in.'
      )

      return
    }


    try {

      setIsSaving(true)


      // ========================================
      // DETERMINE ADD OR UPDATE
      // ========================================

      const isEditing =
        editingExpenseId !== null


      const url = isEditing
        ? `/api/expenses/${editingExpenseId}`
        : '/api/expenses'


      const method = isEditing
        ? 'PUT'
        : 'POST'


      // ========================================
      // SEND REQUEST
      // ========================================

      const response = await fetch(
        url,
        {
          method: method,

          headers: {
            'Content-Type':
              'application/json',

            'Authorization':
              `Bearer ${token}`
          },

          body: JSON.stringify({
            title: title.trim(),

            amount: Number(amount),

            category: category,

            date: date,

            description:
              description.trim()
          })
        }
      )


      // ========================================
      // READ RESPONSE
      // ========================================

      let data = null

      const responseText =
        await response.text()


      if (responseText) {

        try {

          data =
            JSON.parse(responseText)

        } catch {

          // Backend returned plain text
          data = responseText

        }

      }


      console.log(
        isEditing
          ? 'Update expense response:'
          : 'Save expense response:',
        data
      )


      // ========================================
      // HANDLE ERROR
      // ========================================

      if (!response.ok) {

        let errorMessage =
          isEditing
            ? 'Failed to update expense.'
            : 'Failed to save expense.'


        const backendMessage =
          typeof data === 'string'
            ? data
            : data?.message ||
              data?.error ||
              ''


        // ========================================
        // BUDGET NOT CONFIGURED
        // ========================================

        if (
          backendMessage
            .toLowerCase()
            .includes('no budget configured')
        ) {

          const match =
            backendMessage.match(
              /No budget configured for (.+?) for/
            )


          const categoryName =
            match?.[1] || category


          errorMessage =
            `Budget not allocated for ${categoryName}. Please add a ${categoryName} budget first.`


        } else if (backendMessage) {

          // ========================================
          // OTHER BACKEND ERRORS
          // ========================================

          errorMessage =
            backendMessage

        }


        setSaveError(
          errorMessage
        )

        return

      }


      // ========================================
      // SUCCESS
      // ========================================

      console.log(
        isEditing
          ? 'Expense updated successfully.'
          : 'Expense saved successfully.'
      )


      resetForm()

      setShowAddForm(false)


      // ========================================
      // REFRESH TABLE
      // ========================================

      setRefreshExpenses(
        previous => previous + 1
      )


    } catch (error) {

      console.error(
        isEditing
          ? 'Error updating expense:'
          : 'Error saving expense:',
        error
      )

      setSaveError(
        'Unable to connect to the server.'
      )

    } finally {

      setIsSaving(false)

    }

  }


  // ========================================
  // OPEN DELETE CONFIRMATION
  // ========================================

  const handleOpenDeleteModal = (expense) => {

    setExpenseToDelete(expense)

  }


  // ========================================
  // CLOSE DELETE CONFIRMATION
  // ========================================

  const handleCloseDeleteModal = () => {

    if (deletingExpenseId !== null) {
      return
    }

    setExpenseToDelete(null)

  }


  // ========================================
  // DELETE EXPENSE
  // ========================================

  const handleDeleteExpense = async () => {

    if (!expenseToDelete) {
      return
    }


    // ========================================
    // GET JWT
    // ========================================

    const token =
      localStorage.getItem('token')


    if (!token) {

      setExpenseToDelete(null)

      setSaveError(
        'You are not logged in.'
      )

      return
    }


    try {

      setDeletingExpenseId(
        expenseToDelete.id
      )


      // ========================================
      // DELETE REQUEST
      // ========================================

      const response = await fetch(
        `/api/expenses/${expenseToDelete.id}`,
        {
          method: 'DELETE',

          headers: {
            'Authorization':
              `Bearer ${token}`
          }
        }
      )


      // ========================================
      // HANDLE ERROR
      // ========================================

      if (!response.ok) {

        let errorMessage =
          'Failed to delete expense.'


        const responseText =
          await response.text()


        if (responseText) {

          try {

            const data =
              JSON.parse(responseText)

            errorMessage =
              data.message ||
              data.error ||
              errorMessage

          } catch {

            // Keep default error message

          }

        }


        setSaveError(
          errorMessage
        )

        return
      }


      // ========================================
      // DELETE SUCCESSFUL
      // ========================================

      console.log(
        'Expense deleted successfully.'
      )


      setExpenseToDelete(null)


      // ========================================
      // REFRESH TABLE
      // ========================================

      setRefreshExpenses(
        previous => previous + 1
      )


    } catch (error) {

      console.error(
        'Error deleting expense:',
        error
      )

      setSaveError(
        'Unable to connect to the server.'
      )

    } finally {

      setDeletingExpenseId(
        null
      )

    }

  }


  // ========================================
  // COMPONENT UI
  // ========================================

  return (

    <div className="expenses-page">


      {/* ========================================
          PAGE HEADER
          ======================================== */}

      <div className="expenses-header">

        <div>

          <span className="expenses-eyebrow">
            FINANCIAL TRACKING
          </span>

          <h1>
            Expenses
          </h1>

          <p>
            Manage, search and organize your spending.
          </p>

        </div>


        <button
          className="add-expense-button"
          onClick={handleOpenAddForm}
        >

          <span className="add-button-icon">
            +
          </span>

          Add Expense

        </button>

      </div>


      {/* ========================================
          ADD / EDIT EXPENSE MODAL
          ======================================== */}

      {showAddForm && (

        <div
          className="expense-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              handleCloseForm()

            }

          }}
        >

          <div
            className="expense-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="expense-modal-header">

              <div>

                <span className="modal-eyebrow">

                  {editingExpenseId !== null
                    ? 'EXPENSE MANAGEMENT'
                    : 'NEW TRANSACTION'}

                </span>

                <h2>

                  {editingExpenseId !== null
                    ? 'Edit Expense'
                    : 'Add Expense'}

                </h2>

                <p>

                  {editingExpenseId !== null
                    ? 'Update the details of your expense.'
                    : 'Record a new expense and keep your spending organized.'}

                </p>

              </div>


              <button
                type="button"
                className="expense-modal-close"
                onClick={handleCloseForm}
                disabled={isSaving}
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* MODAL BODY */}

            <div className="expense-modal-body">


              {/* EXPENSE DETAILS */}

              <div className="expense-section-title">
                EXPENSE DETAILS
              </div>


              <div className="expense-form-grid">


                {/* TITLE */}

                <div className="expense-form-field expense-form-field-full">

                  <label>
                    Expense Title
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Lunch with friends"
                    value={title}
                    onChange={(event) =>
                      setTitle(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                    autoFocus
                  />

                </div>


                {/* AMOUNT */}

                <div className="expense-form-field">

                  <label>
                    Amount
                  </label>

                  <div className="amount-input-wrapper">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(event) =>
                        setAmount(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                    />

                  </div>

                </div>


                {/* DATE */}

                <div className="expense-form-field">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />

                </div>

              </div>


              {/* CATEGORY */}

              <div className="expense-category-section">

                <span className="expense-category-label">
                  Category
                </span>


                <div className="expense-category-grid">

                  {categories.map(
                    (item) => (

                      <button
                        key={item.name}
                        type="button"
                        className={
                          category === item.name
                            ? 'expense-category-card selected'
                            : 'expense-category-card'
                        }
                        onClick={() =>
                          setCategory(
                            item.name
                          )
                        }
                        disabled={isSaving}
                      >

                        <span className="category-icon">
                          {item.icon}
                        </span>

                        <span className="category-name">
                          {item.name}
                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>


              {/* DESCRIPTION */}

              <div className="expense-form-field expense-form-field-full description-field">

                <label>

                  Description

                  <span className="optional-label">
                    Optional
                  </span>

                </label>

                <textarea
                  placeholder="Add a short note about this expense..."
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  disabled={isSaving}
                  maxLength={500}
                />

                <span className="character-count">
                  {description.length}/500
                </span>

              </div>


              {/* ERROR */}

              {saveError && (

                <div className="expense-save-error">

                  <span className="error-icon">
                    !
                  </span>

                  <span>
                    {saveError}
                  </span>

                </div>

              )}

            </div>


            {/* MODAL FOOTER */}

            <div className="expense-modal-footer">

              <button
                type="button"
                className="expense-cancel-button"
                onClick={handleCloseForm}
                disabled={isSaving}
              >
                Cancel
              </button>


              <button
                type="button"
                className="expense-save-button"
                onClick={handleSaveExpense}
                disabled={isSaving}
              >

                {isSaving ? (

                  <>
                    <span className="button-spinner"></span>
                    Saving...
                  </>

                ) : (

                  <>

                    <span>
                      {editingExpenseId !== null
                        ? '✓'
                        : '+'}
                    </span>

                    {editingExpenseId !== null
                      ? 'Save Changes'
                      : 'Add Expense'}

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ========================================
          DELETE CONFIRMATION MODAL
          ======================================== */}

      {expenseToDelete && (

        <div
          className="expense-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              handleCloseDeleteModal()

            }

          }}
        >

          <div
            className="expense-delete-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="expense-delete-icon">
              !
            </div>


            <h2>
              Delete Expense?
            </h2>


            <p>

              Are you sure you want to delete

              <strong>
                {' '}
                {expenseToDelete.title}
              </strong>
              ?

              <br />

              This action cannot be undone.

            </p>


            <div className="expense-delete-actions">

              <button
                type="button"
                className="expense-delete-cancel-button"
                onClick={handleCloseDeleteModal}
                disabled={
                  deletingExpenseId !== null
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="expense-delete-confirm-button"
                onClick={handleDeleteExpense}
                disabled={
                  deletingExpenseId !== null
                }
              >

                {deletingExpenseId !== null
                  ? 'Deleting...'
                  : 'Delete Expense'}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ========================================
          SUMMARY CARDS
          ======================================== */}

      <div className="expense-summary-grid">


        {/* MONTHLY SPENDING */}

        <div className="expense-summary-card">

          <div className="summary-card-top">

            <span>
              THIS MONTH
            </span>

            <div className="summary-icon blue">
              ₹
            </div>

          </div>

          <h2>
            ₹
            {expenses
              .reduce(
                (total, expense) =>
                  total +
                  Number(expense.amount || 0),
                0
              )
              .toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
          </h2>

          <p>
            Current page total
          </p>

        </div>


        {/* TRANSACTIONS */}

        <div className="expense-summary-card">

          <div className="summary-card-top">

            <span>
              TRANSACTIONS
            </span>

            <div className="summary-icon purple">
              #
            </div>

          </div>

          <h2>
            {expenses.length}
          </h2>

          <p>
            Showing current page
          </p>

        </div>


        {/* AVERAGE */}

        <div className="expense-summary-card">

          <div className="summary-card-top">

            <span>
              AVG. EXPENSE
            </span>

            <div className="summary-icon green">
              ≈
            </div>

          </div>

          <h2>

            ₹

            {expenses.length > 0
              ? (
                  expenses.reduce(
                    (total, expense) =>
                      total +
                      Number(
                        expense.amount || 0
                      ),
                    0
                  ) /
                  expenses.length
                ).toLocaleString(
                  'en-IN',
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }
                )
              : '0.00'}

          </h2>

          <p>
            Average on current page
          </p>

        </div>

      </div>


      {/* ========================================
          EXPENSE FILTERS
          ======================================== */}

      <div className="expense-filters-card">

        <div className="filter-search">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (

            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setSearch('')
              }
            >
              ×
            </button>

          )}

        </div>


        <div className="filter-controls">


          {/* MONTH */}

          <select
            value={month}
            onChange={(event) =>
              setMonth(
                Number(
                  event.target.value
                )
              )
            }
          >

            <option value={1}>
              January
            </option>

            <option value={2}>
              February
            </option>

            <option value={3}>
              March
            </option>

            <option value={4}>
              April
            </option>

            <option value={5}>
              May
            </option>

            <option value={6}>
              June
            </option>

            <option value={7}>
              July
            </option>

            <option value={8}>
              August
            </option>

            <option value={9}>
              September
            </option>

            <option value={10}>
              October
            </option>

            <option value={11}>
              November
            </option>

            <option value={12}>
              December
            </option>

          </select>


          {/* YEAR */}

          <select
            value={year}
            onChange={(event) =>
              setYear(
                Number(
                  event.target.value
                )
              )
            }
          >

            <option value={2026}>
              2026
            </option>

            <option value={2027}>
              2027
            </option>

          </select>


          {/* SORT */}

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value
              )
            }
          >

            <option value="date">
              Sort: Date
            </option>

            <option value="amount">
              Sort: Amount
            </option>

            <option value="title">
              Sort: Title
            </option>

          </select>


          {/* ORDER */}

          <button
            type="button"
            className="sort-direction-button"
            onClick={() =>
              setDirection(
                previous =>
                  previous === 'asc'
                    ? 'desc'
                    : 'asc'
              )
            }
            title={
              direction === 'asc'
                ? 'Ascending'
                : 'Descending'
            }
          >

            {direction === 'asc'
              ? '↑'
              : '↓'}

          </button>

        </div>

      </div>


      {/* ========================================
          EXPENSE TABLE
          ======================================== */}

      <div className="expense-table-card">


        {/* TABLE HEADER */}

        <div className="table-card-header">

          <div>

            <h2>
              Recent Expenses
            </h2>

            <p>
              Your recorded transactions
            </p>

          </div>

          <span className="expense-count-badge">
            {expenses.length} shown
          </span>

        </div>


        {expenses.length === 0 ? (

          <div className="empty-expenses">

            <div className="empty-icon">
              ₹
            </div>

            <h3>
              No expenses found
            </h3>

            <p>
              Try changing your filters or
              add a new expense.
            </p>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="empty-add-button"
            >
              + Add Expense
            </button>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="expense-table">

              <thead>

                <tr>

                  <th>
                    Expense
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {expenses.map(
                  (expense) => (

                    <tr
                      key={expense.id}
                    >


                      {/* TITLE */}

                      <td>

                        <div className="expense-name-cell">

                          <div className="expense-row-icon">

                            {categories.find(
                              item =>
                                item.name ===
                                expense.category
                            )?.icon || '•'}

                          </div>

                          <div>

                            <strong>
                              {expense.title}
                            </strong>

                            <span>
                              #{expense.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* CATEGORY */}

                      <td>

                        <span className="category-badge">

                          {expense.category}

                        </span>

                      </td>


                      {/* AMOUNT */}

                      <td className="expense-amount">

                        ₹

                        {Number(
                          expense.amount
                        ).toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }
                        )}

                      </td>


                      {/* DATE */}

                      <td className="expense-date">

                        {expense.date}

                      </td>


                      {/* DESCRIPTION */}

                      <td className="expense-description">

                        {expense.description ||
                          'No description'}

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="expense-actions">


                          {/* EDIT */}

                          <button
                            type="button"
                            className="edit-expense-button"
                            onClick={() =>
                              handleEditExpense(
                                expense
                              )
                            }
                            disabled={
                              deletingExpenseId !==
                              null
                            }
                          >
                            Edit
                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            className="delete-expense-button"
                            onClick={() =>
                              handleOpenDeleteModal(
                                expense
                              )
                            }
                            disabled={
                              deletingExpenseId !==
                              null
                            }
                          >

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ========================================
          PAGINATION
          ======================================== */}

      {totalPages > 0 && (

        <div className="pagination">

          <button
            className="pagination-button"
            onClick={() =>
              setPage(page - 1)
            }
            disabled={
              page === 0
            }
          >
            ← Previous
          </button>


          <div className="pagination-info">

            <span>
              Page
            </span>

            <strong>
              {page + 1}
            </strong>

            <span>
              of {totalPages}
            </span>

          </div>


          <button
            className="pagination-button"
            onClick={() =>
              setPage(page + 1)
            }
            disabled={
              page >= totalPages - 1
            }
          >
            Next →
          </button>

        </div>

      )}

    </div>

  )
}

export default Expenses