import { useEffect, useState } from 'react'
import './Dashboard.css'
import SummaryCard from '../../SummaryCard'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'

const CATEGORY_COLORS = {
  Food: '#3b82f6',
  Travel: '#22c55e',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Entertainment: '#8b5cf6',
  Others: '#64748b'
}

function Dashboard() {
  const [dashboard, setDashboard] = useState(null)

  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  )

  const [year, setYear] = useState(
    new Date().getFullYear()
  )

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(
          `/api/dashboard?month=${month}&year=${year}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard')
        }

        const data = await response.json()

        setDashboard(data)

      } catch (error) {
        console.error(
          'Error fetching dashboard:',
          error
        )
      }
    }

    fetchDashboard()
  }, [month, year])

  if (!dashboard) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <span>Loading your dashboard...</span>
      </div>
    )
  }

  const categoryData = Object.entries(
    dashboard.categoryWiseExpenses || {}
  ).map(([name, value]) => ({
    name,
    value: Number(value)
  }))

  const totalExpenses =
    Number(dashboard.totalExpenses) || 0

  const budget =
    Number(dashboard.budget) || 0

  const remainingBudget =
    Number(dashboard.remainingBudget) || 0

  const budgetUsedPercentage =
    budget > 0
      ? Math.min(
          (totalExpenses / budget) * 100,
          100
        )
      : 0

  const isOverBudget =
    remainingBudget < 0

  const formattedMonth =
    new Date(
      year,
      month - 1
    ).toLocaleString('en-US', {
      month: 'long'
    })

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="dashboard-header">

        <div className="dashboard-heading">

          <span className="dashboard-eyebrow">
            FINANCIAL OVERVIEW
          </span>

          <h1>Dashboard</h1>

          <p>
            Track your spending and stay on top
            of your monthly budget.
          </p>

        </div>

        <div className="dashboard-controls">

          <div className="month-selector">

            <span className="selector-label">
              MONTH
            </span>

            <select
              value={month}
              onChange={(event) =>
                setMonth(
                  Number(event.target.value)
                )
              }
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>

          </div>

          <div className="month-selector">

            <span className="selector-label">
              YEAR
            </span>

            <select
              value={year}
              onChange={(event) =>
                setYear(
                  Number(event.target.value)
                )
              }
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

          </div>

        </div>

      </header>


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <section className="summary-cards">

        <div className="dashboard-summary-card spending-card">

          <div className="summary-card-top">
            <span>MONTHLY SPENDING</span>

            <div className="summary-icon">
              ₹
            </div>
          </div>

          <div className="summary-card-value">
            ₹{totalExpenses.toFixed(2)}
          </div>

          <div className="summary-card-bottom">
            <span>{formattedMonth}</span>
            <span>
              {dashboard.totalTransactions} transactions
            </span>
          </div>

        </div>


        <div className="dashboard-summary-card budget-card">

          <div className="summary-card-top">
            <span>MONTHLY BUDGET</span>

            <div className="summary-icon">
              ◈
            </div>
          </div>

          <div className="summary-card-value">
            ₹{budget.toFixed(2)}
          </div>

          <div className="summary-card-bottom">
            <span>Budget limit</span>
            <span>
              {budgetUsedPercentage.toFixed(0)}% used
            </span>
          </div>

        </div>


        <div className="dashboard-summary-card remaining-card">

          <div className="summary-card-top">
            <span>REMAINING</span>

            <div className="summary-icon">
              ✓
            </div>
          </div>

          <div className="summary-card-value">
            ₹{Math.abs(remainingBudget).toFixed(2)}
          </div>

          <div className="summary-card-bottom">

            <span>
              {isOverBudget
                ? 'Over budget'
                : 'Available'}
            </span>

            <span
              className={
                isOverBudget
                  ? 'status-negative'
                  : 'status-positive'
              }
            >
              {isOverBudget
                ? 'Exceeded'
                : 'On track'}
            </span>

          </div>

        </div>

      </section>


      {/* =========================
          MAIN DASHBOARD GRID
      ========================= */}

      <section className="dashboard-main-grid">


        {/* =========================
            SPENDING CHART
        ========================= */}

        <div className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>
              <h2>Spending Overview</h2>

              <p>
                Where your money went this month
              </p>
            </div>

            <span className="panel-period">
              {formattedMonth}
            </span>

          </div>


          {categoryData.length === 0 ? (

            <div className="dashboard-empty">
              <span>₹</span>
              <p>No spending data available.</p>
            </div>

          ) : (

            <div className="chart-wrapper">

              <ResponsiveContainer
                width="100%"
                height={330}
              >

                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={72}
                    outerRadius={112}
                    paddingAngle={3}
                  >

                    {categoryData.map(
                      (entry, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CATEGORY_COLORS[
                              entry.name
                            ] || '#94a3b8'
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toFixed(2)}`
                    }
                  />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>


        {/* =========================
            BUDGET STATUS
        ========================= */}

        <div className="dashboard-panel budget-panel">

          <div className="panel-header">

            <div>
              <h2>Budget Status</h2>

              <p>
                {formattedMonth} spending progress
              </p>
            </div>

            <span
              className={
                isOverBudget
                  ? 'budget-badge danger'
                  : 'budget-badge success'
              }
            >
              {isOverBudget
                ? 'Over budget'
                : 'On track'}
            </span>

          </div>


          <div className="budget-highlight">

            <span>Remaining</span>

            <strong
              className={
                isOverBudget
                  ? 'amount-danger'
                  : 'amount-positive'
              }
            >
              ₹{Math.abs(remainingBudget).toFixed(2)}
            </strong>

          </div>


          <div className="budget-progress-section">

            <div className="progress-label">

              <span>
                Budget used
              </span>

              <strong>
                {budgetUsedPercentage.toFixed(0)}%
              </strong>

            </div>

            <div className="progress-track">

              <div
                className={
                  isOverBudget
                    ? 'progress-fill danger'
                    : 'progress-fill'
                }
                style={{
                  width: `${budgetUsedPercentage}%`
                }}
              />

            </div>

          </div>


          <div className="budget-details">

            <div>
              <span>Budget</span>
              <strong>
                ₹{budget.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Spent</span>
              <strong>
                ₹{totalExpenses.toFixed(2)}
              </strong>
            </div>

          </div>

        </div>

      </section>


      {/* =========================
          CATEGORY BREAKDOWN
      ========================= */}

      <section className="dashboard-panel category-panel">

        <div className="panel-header">

          <div>
            <h2>Category Breakdown</h2>

            <p>
              Your spending by category
            </p>
          </div>

          <span className="panel-period">
            {categoryData.length} categories
          </span>

        </div>


        {categoryData.length === 0 ? (

          <div className="dashboard-empty">
            <span>◎</span>
            <p>No expenses for this month.</p>
          </div>

        ) : (

          <div className="category-list">

            {categoryData
              .sort((a, b) => b.value - a.value)
              .map((category) => {

                const percentage =
                  totalExpenses > 0
                    ? (category.value /
                        totalExpenses) *
                      100
                    : 0

                return (
                  <div
                    className="category-item"
                    key={category.name}
                  >

                    <div className="category-item-header">

                      <div className="category-title">

                        <span
                          className="category-dot"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[
                                category.name
                              ] || '#94a3b8'
                          }}
                        />

                        <span>
                          {category.name}
                        </span>

                      </div>

                      <div className="category-amount">

                        <strong>
                          ₹{category.value.toFixed(2)}
                        </strong>

                        <span>
                          {percentage.toFixed(0)}%
                        </span>

                      </div>

                    </div>


                    <div className="category-progress">

                      <div
                        className="category-progress-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor:
                            CATEGORY_COLORS[
                              category.name
                            ] || '#94a3b8'
                        }}
                      />

                    </div>

                  </div>
                )
              })}

          </div>

        )}

      </section>

    </div>
  )
}

export default Dashboard