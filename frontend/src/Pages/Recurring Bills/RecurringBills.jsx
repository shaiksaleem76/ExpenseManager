import { useEffect, useState } from 'react'
import './RecurringBills.css'

const API_URL =
  '/api/recurring-bills'

function RecurringBills() {

  // ========================================
  // STATE
  // ========================================

  const [bills, setBills] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [success, setSuccess] = useState('')

  const [showModal, setShowModal] = useState(false)

  const [editingBill, setEditingBill] = useState(null)

  const [deletingBill, setDeletingBill] = useState(null)

  const [saving, setSaving] = useState(false)


  // ========================================
  // FORM STATE
  // ========================================

  const [formData, setFormData] = useState({

    name: '',

    amount: '',

    frequency: 'MONTHLY',

    startDate: '',

    nextDueDate: '',

    category: ''

  })


  // ========================================
  // TOKEN
  // ========================================

  const token =
    localStorage.getItem('token')


  // ========================================
  // FETCH ALL BILLS
  // ========================================

  const fetchBills = async () => {

    try {

      setLoading(true)

      setError('')

      const response = await fetch(
        API_URL,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )


      if (!response.ok) {

        throw new Error(
          'Failed to load recurring bills'
        )

      }


      const data =
        await response.json()


      setBills(data)

    } catch (err) {

      setError(
        err.message ||
        'Something went wrong'
      )

    } finally {

      setLoading(false)

    }

  }


  // ========================================
  // LOAD BILLS WHEN PAGE OPENS
  // ========================================

  useEffect(() => {

    fetchBills()

  }, [])


  // ========================================
  // FORM INPUT CHANGE
  // ========================================

  const handleInputChange = (event) => {

    const {
      name,
      value
    } = event.target


    setFormData(
      previous => ({
        ...previous,
        [name]: value
      })
    )

  }


  // ========================================
  // OPEN ADD MODAL
  // ========================================

  const openAddModal = () => {

    setEditingBill(null)

    setFormData({

      name: '',

      amount: '',

      frequency: 'MONTHLY',

      startDate: '',

      nextDueDate: '',

      category: ''

    })

    setError('')

    setSuccess('')

    setShowModal(true)

  }


  // ========================================
  // OPEN EDIT MODAL
  // ========================================

  const openEditModal = (bill) => {

    setEditingBill(bill)

    setFormData({

      name: bill.name || '',

      amount: bill.amount || '',

      frequency:
        bill.frequency || 'MONTHLY',

      startDate:
        bill.startDate || '',

      nextDueDate:
        bill.nextDueDate || '',

      category:
        bill.category || ''

    })

    setError('')

    setSuccess('')

    setShowModal(true)

  }


  // ========================================
  // CLOSE MODAL
  // ========================================

  const closeModal = () => {

    if (saving) {
      return
    }

    setShowModal(false)

    setEditingBill(null)

  }


  // ========================================
  // SAVE BILL
  // POST / PUT
  // ========================================

  const handleSubmit = async (event) => {

    event.preventDefault()

    setSaving(true)

    setError('')

    setSuccess('')


    try {

      const requestData = {

        name: formData.name,

        amount: Number(formData.amount),

        frequency:
          formData.frequency,

        startDate:
          formData.startDate,

        nextDueDate:
          formData.nextDueDate,

        category:
          formData.category

      }


      const url = editingBill

        ? `${API_URL}/${editingBill.id}`

        : API_URL


      const method = editingBill
        ? 'PUT'
        : 'POST'


      const response = await fetch(
        url,
        {

          method,

          headers: {

            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`

          },

          body:
            JSON.stringify(requestData)

        }
      )


      if (!response.ok) {

        let message =
          editingBill
            ? 'Failed to update recurring bill'
            : 'Failed to create recurring bill'


        try {

          const errorData =
            await response.json()

          if (errorData.message) {
            message =
              errorData.message
          }

        } catch {
          // Ignore JSON parsing error
        }


        throw new Error(message)

      }


      setShowModal(false)

      setEditingBill(null)


      setSuccess(
        editingBill
          ? 'Recurring bill updated successfully'
          : 'Recurring bill added successfully'
      )


      await fetchBills()


    } catch (err) {

      setError(
        err.message ||
        'Something went wrong'
      )

    } finally {

      setSaving(false)

    }

  }


  // ========================================
  // DELETE BILL
  // ========================================

  const handleDelete = async () => {

    if (!deletingBill) {
      return
    }


    try {

      setError('')

      setSuccess('')


      const response =
        await fetch(
          `${API_URL}/${deletingBill.id}`,
          {

            method: 'DELETE',

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }
        )


      if (!response.ok) {

        throw new Error(
          'Failed to delete recurring bill'
        )

      }


      setDeletingBill(null)


      setSuccess(
        'Recurring bill deleted successfully'
      )


      await fetchBills()


    } catch (err) {

      setError(
        err.message ||
        'Something went wrong'
      )

    }

  }


  // ========================================
  // FORMAT CURRENCY
  // ========================================

  const formatCurrency = (value) => {

    return `₹${Number(
      value || 0
    ).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2
      }
    )}`

  }


  // ========================================
  // FORMAT FREQUENCY
  // ========================================

  const formatFrequency = (
    frequency
  ) => {

    if (!frequency) {
      return ''
    }


    return frequency
      .toLowerCase()
      .replace(
        /^\w/,
        letter =>
          letter.toUpperCase()
      )

  }


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div className="recurring-page">

        <div className="recurring-loading">

          <div className="recurring-loading-spinner">
          </div>

          <p>
            Loading recurring bills...
          </p>

        </div>

      </div>

    )

  }


  // ========================================
  // UI
  // ========================================

  return (

    <div className="recurring-page">


      {/* ========================================
          PAGE HEADER
          ======================================== */}

      <div className="recurring-page-header">

        <div>

          <div className="recurring-eyebrow">
            AUTOMATIC PAYMENTS
          </div>

          <h1>
            Recurring Bills
          </h1>

          <p>
            Keep track of your regular monthly
            and recurring payments.
          </p>

        </div>


        <button
          className="recurring-add-button"
          onClick={openAddModal}
        >

          <span>
            +
          </span>

          Add Bill

        </button>

      </div>


      {/* ========================================
          SUCCESS MESSAGE
          ======================================== */}

      {success && (

        <div className="recurring-success">

          <span>
            ✓
          </span>

          {success}

          <button
            onClick={() =>
              setSuccess('')
            }
          >
            ×
          </button>

        </div>

      )}


      {/* ========================================
          ERROR MESSAGE
          ======================================== */}

      {error && (

        <div className="recurring-error">

          <span>
            !
          </span>

          {error}

          <button
            onClick={() =>
              setError('')
            }
          >
            ×
          </button>

        </div>

      )}


      {/* ========================================
          EMPTY STATE
          ======================================== */}

      {bills.length === 0 ? (

        <div className="recurring-empty-card">

          <div className="recurring-empty-icon">
            ↻
          </div>

          <h3>
            No recurring bills
          </h3>

          <p>
            You haven't added any recurring
            payments yet.
          </p>

          <button
            className="recurring-add-button"
            onClick={openAddModal}
          >

            <span>
              +
            </span>

            Add Bill

          </button>

        </div>

      ) : (

        /* ========================================
           BILLS GRID
           ======================================== */

        <div className="recurring-bills-grid">

          {bills.map((bill) => (

            <div
              className="recurring-bill-card"
              key={bill.id}
            >


              {/* BILL HEADER */}

              <div className="recurring-bill-header">

                <div className="recurring-bill-icon">
                  ↻
                </div>


                <div className="recurring-bill-title">

                  <h3>
                    {bill.name}
                  </h3>

                  <span>
                    {bill.category}
                  </span>

                </div>


                <div
                  className={
                    bill.active
                      ? 'recurring-status active'
                      : 'recurring-status inactive'
                  }
                >

                  {bill.active
                    ? 'Active'
                    : 'Inactive'}

                </div>

              </div>


              {/* AMOUNT */}

              <div className="recurring-bill-amount">

                <span>
                  AMOUNT
                </span>

                <strong>
                  {formatCurrency(
                    bill.amount
                  )}
                </strong>

              </div>


              {/* DETAILS */}

              <div className="recurring-bill-details">

                <div>

                  <span>
                    FREQUENCY
                  </span>

                  <strong>
                    {formatFrequency(
                      bill.frequency
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    NEXT DUE
                  </span>

                  <strong>
                    {bill.nextDueDate}
                  </strong>

                </div>

              </div>


              {/* FOOTER */}

              <div className="recurring-bill-footer">

                <span>
                  Started {bill.startDate}
                </span>


                <div className="recurring-actions">

                  <button
                    onClick={() =>
                      openEditModal(bill)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-action"
                    onClick={() =>
                      setDeletingBill(bill)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* ========================================
          ADD / EDIT MODAL
          ======================================== */}

      {showModal && (

        <div
          className="recurring-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal()
            }

          }}
        >

          <div className="recurring-modal">


            {/* MODAL HEADER */}

            <div className="recurring-modal-header">

              <div>

                <span>
                  {editingBill
                    ? 'UPDATE PAYMENT'
                    : 'NEW PAYMENT'}
                </span>

                <h2>
                  {editingBill
                    ? 'Edit Recurring Bill'
                    : 'Add Recurring Bill'}
                </h2>

              </div>


              <button
                className="recurring-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="recurring-form"
              onSubmit={handleSubmit}
            >


              {/* NAME */}

              <div className="recurring-form-group">

                <label>
                  Bill Name
                </label>

                <input
                  className="recurring-input"
                  type="text"
                  name="name"
                  placeholder="e.g. Netflix"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

              </div>


              {/* AMOUNT */}

              <div className="recurring-form-group">

                <label>
                  Amount
                </label>

                <div className="recurring-amount-input">

                  <span>
                    ₹
                  </span>

                  <input
                    className="recurring-input"
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />

                </div>

              </div>


              {/* FREQUENCY + CATEGORY */}

              <div className="recurring-form-row">


                <div className="recurring-form-group">

                  <label>
                    Frequency
                  </label>

                  <select
                    className="recurring-input"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    required
                  >

                    <option value="MONTHLY">
                      Monthly
                    </option>

                    <option value="WEEKLY">
                      Weekly
                    </option>

                    <option value="YEARLY">
                      Yearly
                    </option>

                  </select>

                </div>


                <div className="recurring-form-group">

                  <label>
                    Category
                  </label>

                  <select
                    className="recurring-input"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >

                    <option value="">
                      Select category
                    </option>

                    <option value="Food">
                      Food
                    </option>

                    <option value="Travel">
                      Travel
                    </option>

                    <option value="Shopping">
                      Shopping
                    </option>

                    <option value="Bills">
                      Bills
                    </option>

                    <option value="Entertainment">
                      Entertainment
                    </option>

                    <option value="Others">
                      Others
                    </option>

                  </select>

                </div>

              </div>


              {/* DATES */}

              <div className="recurring-form-row">


                <div className="recurring-form-group">

                  <label>
                    Start Date
                  </label>

                  <input
                    className="recurring-input"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />

                </div>


                <div className="recurring-form-group">

                  <label>
                    Next Due Date
                  </label>

                  <input
                    className="recurring-input"
                    type="date"
                    name="nextDueDate"
                    value={formData.nextDueDate}
                    onChange={handleInputChange}
                    required
                  />

                </div>

              </div>


              {/* BUTTONS */}

              <div className="recurring-form-actions">

                <button
                  type="button"
                  className="recurring-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="recurring-save-button"
                  disabled={saving}
                >

                  {saving
                    ? 'Saving...'
                    : editingBill
                      ? 'Update Bill'
                      : 'Add Bill'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ========================================
          DELETE CONFIRMATION
          ======================================== */}

      {deletingBill && (

        <div
          className="recurring-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setDeletingBill(null)
            }

          }}
        >

          <div className="recurring-delete-modal">

            <div className="recurring-delete-icon">
              !
            </div>

            <h2>
              Delete Recurring Bill?
            </h2>

            <p>
              Are you sure you want to delete
              <strong>
                {' '}
                {deletingBill.name}
              </strong>
              ?
              <br />
              This action cannot be undone.
            </p>


            <div className="recurring-form-actions">

              <button
                className="recurring-cancel-button"
                onClick={() =>
                  setDeletingBill(null)
                }
              >
                Cancel
              </button>

              <button
                className="recurring-delete-confirm-button"
                onClick={handleDelete}
              >
                Delete Bill
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}

export default RecurringBills