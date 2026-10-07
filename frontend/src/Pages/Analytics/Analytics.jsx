import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

import './Analytics.css'

const API_BASE_URL = 'http://localhost:8080/api/analytics'

function Analytics() {

  // ========================================
  // STATE
  // ========================================

  const [monthlyData, setMonthlyData] = useState({})
  const [categoryData, setCategoryData] = useState({})
  const [comparisonData, setComparisonData] = useState({})
  const [averageMonthly, setAverageMonthly] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  )


  // ========================================
  // FETCH ANALYTICS DATA
  // ========================================

  useEffect(() => {

    const fetchAnalytics = async () => {

      try {

        setLoading(true)
        setError('')

        const token = localStorage.getItem('token')

        const headers = {
          Authorization: `Bearer ${token}`
        }

        const [
          monthlyResponse,
          categoryResponse,
          comparisonResponse,
          averageResponse
        ] = await Promise.all([

          fetch(`${API_BASE_URL}/monthly`, {
            method: 'GET',
            headers
          }),

          fetch(`${API_BASE_URL}/category`, {
            method: 'GET',
            headers
          }),

          fetch(`${API_BASE_URL}/comparison`, {
            method: 'GET',
            headers
          }),

          fetch(`${API_BASE_URL}/average`, {
            method: 'GET',
            headers
          })

        ])


        if (
          !monthlyResponse.ok ||
          !categoryResponse.ok ||
          !comparisonResponse.ok ||
          !averageResponse.ok
        ) {
          throw new Error('Failed to load analytics data')
        }


        const monthly = await monthlyResponse.json()
        const category = await categoryResponse.json()
        const comparison = await comparisonResponse.json()
        const average = await averageResponse.json()


        setMonthlyData(monthly || {})
        setCategoryData(category || {})
        setComparisonData(comparison || {})
        setAverageMonthly(Number(average || 0))

      } catch (err) {

        console.error('Error fetching analytics:', err)

        setError(
          err.message || 'Unable to load analytics data'
        )

      } finally {

        setLoading(false)

      }

    }


    fetchAnalytics()

  }, [selectedYear])


  // ========================================
  // FORMAT CURRENCY
  // ========================================

  const formatCurrency = (value) => {

    return `₹${Number(value || 0).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2
      }
    )}`

  }


  // ========================================
  // MONTHLY CHART DATA
  // ========================================

  const monthlyChartData = useMemo(() => {

    return Object.entries(monthlyData).map(
      ([month, amount]) => ({
        month,
        amount: Number(amount || 0)
      })
    )

  }, [monthlyData])


  // ========================================
  // CATEGORY CHART DATA
  // ========================================

  const categoryChartData = useMemo(() => {

    return Object.entries(categoryData).map(
      ([category, amount]) => ({
        name: category,
        value: Number(amount || 0)
      })
    )

  }, [categoryData])


  // ========================================
  // HIGHEST SPENDING MONTH
  // ========================================

  const highestSpending = useMemo(() => {

    if (monthlyChartData.length === 0) {

      return {
        month: '-',
        amount: 0
      }

    }


    return monthlyChartData.reduce(
      (highest, current) => {

        if (current.amount > highest.amount) {
          return current
        }

        return highest

      },
      {
        month: '-',
        amount: 0
      }
    )

  }, [monthlyChartData])


  // ========================================
  // MONTHLY CHANGE
  // ========================================

  const monthlyChange = useMemo(() => {

    return {

      currentMonth: Number(
        comparisonData.currentMonth || 0
      ),

      previousMonth: Number(
        comparisonData.previousMonth || 0
      ),

      difference: Number(
        comparisonData.difference || 0
      ),

      percentageChange: Number(
        comparisonData.percentageChange || 0
      )

    }

  }, [comparisonData])


  // ========================================
  // YEAR OPTIONS
  // ========================================

  const yearOptions = [
    selectedYear - 2,
    selectedYear - 1,
    selectedYear,
    selectedYear + 1
  ]


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div className="analytics-page">

        <div className="analytics-loading">

          <div className="analytics-loading-spinner"></div>

          <p>Loading analytics...</p>

        </div>

      </div>

    )

  }


  // ========================================
  // MAIN UI
  // ========================================

  return (

    <div className="analytics-page">


      {/* ========================================
          HEADER
          ======================================== */}

      <div className="analytics-header">

        <div>

          <div className="analytics-eyebrow">
            SPENDING INSIGHTS
          </div>

          <h1>Analytics</h1>

          <p>
            Understand your spending patterns and
            manage your money better.
          </p>

        </div>


        <select
          className="analytics-year-select"
          value={selectedYear}
          onChange={(event) =>
            setSelectedYear(Number(event.target.value))
          }
        >

          {yearOptions.map((year) => (

            <option
              key={year}
              value={year}
            >
              {year}
            </option>

          ))}

        </select>

      </div>


      {/* ========================================
          ERROR
          ======================================== */}

      {error && (

        <div className="analytics-error">

          <span>!</span>

          {error}

        </div>

      )}


      {/* ========================================
          SUMMARY CARDS
          ======================================== */}

      <div className="analytics-summary-grid">


        {/* AVERAGE MONTHLY */}

        <div className="analytics-summary-card">

          <span className="analytics-summary-label">
            AVERAGE MONTHLY
          </span>

          <strong>
            {formatCurrency(averageMonthly)}
          </strong>

          <span className="analytics-summary-description">
            Average spending per month
          </span>

        </div>


        {/* HIGHEST SPENDING */}

        <div className="analytics-summary-card">

          <span className="analytics-summary-label">
            HIGHEST SPENDING
          </span>

          <strong>
            {formatCurrency(highestSpending.amount)}
          </strong>

          <span className="analytics-summary-description">
            {highestSpending.month}
          </span>

        </div>


        {/* MONTHLY CHANGE */}

        <div className="analytics-summary-card">

          <span className="analytics-summary-label">
            MONTHLY CHANGE
          </span>

          <strong
            className={
              monthlyChange.percentageChange > 0
                ? 'analytics-change-up'
                : monthlyChange.percentageChange < 0
                  ? 'analytics-change-down'
                  : ''
            }
          >

            {monthlyChange.percentageChange > 0 && '+'}

            {monthlyChange.percentageChange}%

          </strong>

          <span className="analytics-summary-description">
            vs previous month
          </span>

        </div>

      </div>


      {/* ========================================
          MAIN CHART AREA
          ======================================== */}

      <div className="analytics-chart-grid">


        {/* MONTHLY SPENDING TREND */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h2>
                Monthly Spending Trend
              </h2>

              <p>
                Your spending across the year.
              </p>

            </div>

          </div>


          {monthlyChartData.length === 0 ? (

            <div className="analytics-empty-chart">
              No monthly spending data available.
            </div>

          ) : (

            <div className="analytics-line-chart">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <LineChart
                  data={monthlyChartData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: 10,
                    bottom: 5
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 11,
                      fill: '#64748b'
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: '#64748b'
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString('en-IN')}`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                    contentStyle={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      boxShadow:
                        '0 8px 24px rgba(15, 23, 42, 0.08)'
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: '#2563eb'
                    }}
                    activeDot={{
                      r: 6
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>


        {/* CATEGORY SPENDING */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h2>
                Category Spending
              </h2>

              <p>
                See where your money goes.
              </p>

            </div>

          </div>


          {categoryChartData.length === 0 ? (

            <div className="analytics-empty-chart">
              No category data available.
            </div>

          ) : (

            <div className="analytics-pie-wrapper">

              <ResponsiveContainer
                width="100%"
                height={250}
              >

                <PieChart>

                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >

                    {categoryChartData.map(
                      (_, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={[
                            '#2563eb',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6',
                            '#06b6d4'
                          ][index % 6]}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{
                      fontSize: '11px'
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

      </div>


      {/* ========================================
          MONTH-TO-MONTH SPENDING
          ======================================== */}

      <div className="analytics-comparison-panel">

        <div className="analytics-comparison-header">

          <div>

            <h2>
              Month-to-Month Spending
            </h2>

            <p>
              Compare your spending across months.
            </p>

          </div>

        </div>


        {Object.keys(comparisonData).length === 0 ? (

          <div className="analytics-empty-comparison">
            No comparison data available.
          </div>

        ) : (

          <div className="analytics-comparison-list">


            {/* CURRENT MONTH */}

            <div className="analytics-comparison-row">

              <div className="analytics-comparison-month">

                <span>
                  Current Month
                </span>

              </div>

              <div className="analytics-comparison-amount">

                {formatCurrency(
                  comparisonData.currentMonth
                )}

              </div>

              <div className="comparison-neutral">

                —

              </div>

            </div>


            {/* PREVIOUS MONTH */}

            <div className="analytics-comparison-row">

              <div className="analytics-comparison-month">

                <span>
                  Previous Month
                </span>

              </div>

              <div className="analytics-comparison-amount">

                {formatCurrency(
                  comparisonData.previousMonth
                )}

              </div>

              <div
                className={
                  Number(comparisonData.difference) > 0
                    ? 'comparison-increase'
                    : Number(comparisonData.difference) < 0
                      ? 'comparison-decrease'
                      : 'comparison-neutral'
                }
              >

                {Number(comparisonData.difference) > 0
                  ? `↑ ${formatCurrency(
                      Math.abs(
                        comparisonData.difference
                      )
                    )}`
                  : Number(comparisonData.difference) < 0
                    ? `↓ ${formatCurrency(
                        Math.abs(
                          comparisonData.difference
                        )
                      )}`
                    : 'No change'}

              </div>

            </div>


            {/* DIFFERENCE */}

            <div className="analytics-comparison-row">

              <div className="analytics-comparison-month">

                <span>
                  Difference
                </span>

              </div>

              <div className="analytics-comparison-amount">

                {formatCurrency(
                  Math.abs(
                    comparisonData.difference || 0
                  )
                )}

              </div>

              <div
                className={
                  Number(comparisonData.difference) > 0
                    ? 'comparison-increase'
                    : Number(comparisonData.difference) < 0
                      ? 'comparison-decrease'
                      : 'comparison-neutral'
                }
              >

                {Number(comparisonData.difference) > 0
                  ? `↑ ${formatCurrency(
                      Math.abs(
                        comparisonData.difference
                      )
                    )}`
                  : Number(comparisonData.difference) < 0
                    ? `↓ ${formatCurrency(
                        Math.abs(
                          comparisonData.difference
                        )
                      )}`
                    : 'No change'}

              </div>

            </div>


            {/* PERCENTAGE CHANGE */}

            <div className="analytics-comparison-row">

              <div className="analytics-comparison-month">

                <span>
                  Percentage Change
                </span>

              </div>

              <div className="analytics-comparison-amount">

                {Number(
                  comparisonData.percentageChange || 0
                )}%

              </div>

              <div
                className={
                  Number(
                    comparisonData.percentageChange
                  ) > 0
                    ? 'comparison-increase'
                    : Number(
                        comparisonData.percentageChange
                      ) < 0
                      ? 'comparison-decrease'
                      : 'comparison-neutral'
                }
              >

                {Number(
                  comparisonData.percentageChange
                ) > 0
                  ? `↑ ${Number(
                      comparisonData.percentageChange
                    )}%`
                  : Number(
                      comparisonData.percentageChange
                    ) < 0
                    ? `↓ ${Math.abs(
                        Number(
                          comparisonData.percentageChange
                        )
                      )}%`
                    : 'No change'}

              </div>

            </div>

          </div>

        )}

      </div>


      {/* ========================================
          AVERAGE MONTHLY EXPENSES
          ======================================== */}

      <div className="analytics-average-section">

        <span>
          AVERAGE MONTHLY EXPENSES
        </span>

        <strong>
          {formatCurrency(averageMonthly)}
        </strong>

        <p>
          Your average spending per month
        </p>

      </div>

    </div>

  )

}

export default Analytics