import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [highRisk, setHighRisk] = useState([]);

  const [riskFilter, setRiskFilter] = useState("ALL");

  const [transactionId, setTransactionId] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statsResponse,
        analyticsResponse,
        riskResponse,
        transactionsResponse,
        highRiskResponse,
      ] = await Promise.all([
        fetch(`${API}/stats`),
        fetch(`${API}/analytics`),
        fetch(`${API}/risk-summary`),
        fetch(
          `${API}/transactions?limit=20&risk_filter=${riskFilter}`
        ),
        fetch(`${API}/high-risk?limit=10`),
      ]);

      if (
        !statsResponse.ok ||
        !analyticsResponse.ok ||
        !riskResponse.ok ||
        !transactionsResponse.ok ||
        !highRiskResponse.ok
      ) {
        throw new Error("Failed to load dashboard data.");
      }

      const statsData = await statsResponse.json();

      const analyticsData =
        await analyticsResponse.json();

      const riskData =
        await riskResponse.json();

      const transactionsData =
        await transactionsResponse.json();

      const highRiskData =
        await highRiskResponse.json();

      console.log(
        "HIGH RISK API RESPONSE:",
        highRiskData
      );

      setStats(statsData);
      setAnalytics(analyticsData);
      setRiskSummary(riskData);

      /*
       * TRANSACTION RESPONSE
       */

      const transactionList =
        Array.isArray(transactionsData)
          ? transactionsData
          : transactionsData.transactions ||
            transactionsData.results ||
            transactionsData.data ||
            [];

      /*
       * HIGH-RISK RESPONSE
       *
       * Backend returns:
       *
       * {
       *   total_high_risk: 16176,
       *   alerts: [...]
       * }
       *
       * Therefore we MUST read:
       *
       * highRiskData.alerts
       */

      const highRiskList =
        Array.isArray(highRiskData)
          ? highRiskData
          : highRiskData.alerts ||
            highRiskData.transactions ||
            highRiskData.high_risk_transactions ||
            highRiskData.results ||
            highRiskData.data ||
            [];

      console.log(
        "HIGH RISK ALERTS USED BY FRONTEND:",
        highRiskList
      );

      setTransactions(
        Array.isArray(transactionList)
          ? transactionList
          : []
      );

      setHighRisk(
        Array.isArray(highRiskList)
          ? highRiskList
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to FraudShield AI backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [riskFilter]);

  /*
   * ANALYZE TRANSACTION
   */

  const analyzeTransaction = async (
    id = transactionId
  ) => {
    if (
      id === "" ||
      id === null ||
      id === undefined
    ) {
      return;
    }

    const numericId = Number(id);

    if (
      !Number.isInteger(numericId) ||
      numericId < 0 ||
      numericId > 284806
    ) {
      setError(
        "Please enter a valid transaction number between 0 and 284806."
      );

      return;
    }

    try {
      setAnalysisLoading(true);
      setError("");

      const response = await fetch(
        `${API}/predict`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            transaction_id: numericId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Transaction analysis failed."
        );
      }

      const data =
        await response.json();

      console.log(
        "PREDICTION API RESPONSE:",
        data
      );

      setAnalysisResult(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to analyze the transaction. Make sure the FastAPI backend is running."
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  /*
   * FORMAT NUMBER
   */

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "-";
    }

    return Number(value).toLocaleString(
      "en-IN"
    );
  };

  /*
   * FORMAT PROBABILITY
   *
   * Backend currently returns:
   *
   * 21.34
   * 4.02
   * 100.0
   *
   * These are already percentage values.
   *
   * Therefore:
   *
   * 21.34 -> 21.34%
   * 100.0 -> 100.00%
   */

  const formatProbability = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "0.00%";
    }

    return `${Number(value).toFixed(2)}%`;
  };

  /*
   * RISK CSS CLASS
   */

  const getRiskClass = (decision) => {
    if (!decision) {
      return "";
    }

    return decision.toLowerCase();
  };

  /*
   * RISK BAR CLASS
   */

  const getRiskFillClass = (decision) => {
    if (!decision) {
      return "";
    }

    const normalized =
      decision.toLowerCase();

    if (normalized === "allow") {
      return "allow-fill";
    }

    if (normalized === "review") {
      return "review-fill";
    }

    return "block-fill";
  };

  /*
   * TRANSACTION DISTRIBUTION
   */

  const distributionData = analytics
    ? [
        {
          name: "Legitimate",
          value:
            analytics.transaction_distribution
              .legitimate,
        },

        {
          name: "Fraud",
          value:
            analytics.transaction_distribution
              .fraud,
        },
      ]
    : [];

  /*
   * MODEL PERFORMANCE
   */

  const performanceData = analytics
    ? [
        {
          metric: "ROC-AUC",
          value:
            analytics.model_performance
              .roc_auc,
        },

        {
          metric: "PR-AUC",
          value:
            analytics.model_performance
              .pr_auc,
        },

        {
          metric: "Fraud Recall",
          value:
            analytics.model_performance
              .fraud_recall,
        },
      ]
    : [];

  /*
   * RISK SUMMARY CHART
   */

  const riskChartData = riskSummary
    ? [
        {
          decision: "ALLOW",
          count: riskSummary.allow,
        },

        {
          decision: "REVIEW",
          count: riskSummary.review,
        },

        {
          decision: "BLOCK",
          count: riskSummary.block,
        },
      ]
    : [];

  /*
   * INITIAL LOADING
   */

  if (loading && !stats) {
    return (
      <div className="app">

        <div className="loading">
          Loading FraudShield AI dashboard...
        </div>

      </div>
    );
  }

  return (
    <div className="app">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            🛡️
          </div>

          <div>

            <h1>
              FraudShield AI
            </h1>

            <div className="system-status">

              <span className="status-dot"></span>

              System Online

            </div>

          </div>

        </div>


        <div className="header-label">
          AI-POWERED FRAUD INTELLIGENCE
        </div>

      </header>


      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="hero">

        <div className="hero-content">

          <span className="eyebrow">
            AI FRAUD DETECTION PLATFORM
          </span>

          <h2>
            Fraud Intelligence Dashboard
          </h2>

          <p>
            Real-time transaction risk monitoring
            and explainable AI analysis.
          </p>

        </div>

      </section>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div className="error-message">

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =====================================================
          TOP STATISTICS
          ===================================================== */}

      {stats && (

        <section className="stats-grid">


          <div className="stat-card">

            <div className="stat-icon blue">
              📊
            </div>

            <div>

              <span className="stat-label">
                Total Transactions
              </span>

              <strong>
                {formatNumber(
                  stats.total_transactions
                )}
              </strong>

              <small>
                Transactions analyzed
              </small>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon red">
              🚨
            </div>

            <div>

              <span className="stat-label">
                Fraud Transactions
              </span>

              <strong className="danger-number">
                {formatNumber(
                  stats.fraud_transactions
                )}
              </strong>

              <small>
                Confirmed fraud cases
              </small>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              ✅
            </div>

            <div>

              <span className="stat-label">
                Legitimate Transactions
              </span>

              <strong>
                {formatNumber(
                  stats.legitimate_transactions
                )}
              </strong>

              <small>
                Normal transactions
              </small>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              📈
            </div>

            <div>

              <span className="stat-label">
                Fraud Rate
              </span>

              <strong>
                {Number(
                  stats.fraud_rate
                ).toFixed(2)}%
              </strong>

              <small>
                Dataset fraud ratio
              </small>

            </div>

          </div>


        </section>

      )}


      {/* =====================================================
          ANALYTICS
          ===================================================== */}

      <section className="section">

        <div className="section-heading">

          <span className="section-tag">
            FRAUD ANALYTICS
          </span>

          <h2>
            Dataset &amp; Model Intelligence
          </h2>

          <p>
            Monitor transaction distribution and
            evaluate the machine learning model.
          </p>

        </div>


        <div className="analytics-grid">


          {/* DISTRIBUTION */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <span className="panel-label">
                  TRANSACTION DISTRIBUTION
                </span>

                <h3>
                  Fraud vs Legitimate
                </h3>

              </div>

              <div className="panel-icon">
                📊
              </div>

            </div>


            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={48}
                    paddingAngle={3}
                  >

                    <Cell />

                    <Cell />

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>


            <div className="distribution-total">

              <span>
                Total
              </span>

              <strong>
                {formatNumber(
                  stats?.total_transactions
                )}
              </strong>

            </div>


            <div className="distribution-row">

              <div className="distribution-info">

                <span className="legend-dot legitimate"></span>

                Legitimate

              </div>

              <strong>
                {formatNumber(
                  analytics
                    ?.transaction_distribution
                    ?.legitimate
                )}
              </strong>

            </div>


            <div className="distribution-row">

              <div className="distribution-info">

                <span className="legend-dot fraud"></span>

                Fraud

              </div>

              <strong className="danger-number">

                {formatNumber(
                  analytics
                    ?.transaction_distribution
                    ?.fraud
                )}

              </strong>

            </div>


            <div className="imbalance-note">

              Highly imbalanced dataset

            </div>

          </div>


          {/* MODEL PERFORMANCE */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <span className="panel-label">
                  MODEL PERFORMANCE
                </span>

                <h3>
                  AI Evaluation Metrics
                </h3>

              </div>

              <div className="panel-icon">
                🎯
              </div>

            </div>


            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={performanceData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="metric"
                  />

                  <YAxis
                    domain={[0, 1]}
                  />

                  <Tooltip
                    formatter={(value) =>
                      Number(value).toFixed(4)
                    }
                  />

                  <Bar
                    dataKey="value"
                    name="Score"
                    radius={[
                      7,
                      7,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            <div className="metrics-grid">


              <div className="metric">

                <span>
                  ROC-AUC
                </span>

                <strong>
                  {analytics
                    ?.model_performance
                    ?.roc_auc
                    ?.toFixed(4)}
                </strong>

              </div>


              <div className="metric">

                <span>
                  PR-AUC
                </span>

                <strong>
                  {analytics
                    ?.model_performance
                    ?.pr_auc
                    ?.toFixed(3)}
                </strong>

              </div>


              <div className="metric">

                <span>
                  Fraud Recall
                </span>

                <strong>
                  {analytics
                    ?.model_performance
                    ?.fraud_recall
                    ?.toFixed(2)}
                </strong>

              </div>


            </div>

          </div>


        </div>

      </section>


      {/* =====================================================
          RISK SUMMARY
          ===================================================== */}

      {riskSummary && (

        <section className="section">

          <div className="section-heading">

            <span className="section-tag">
              RISK INTELLIGENCE
            </span>

            <h2>
              Risk Summary
            </h2>

            <p>
              Current transaction decisions
              generated by the FraudShield AI
              risk engine.
            </p>

          </div>


          <div className="stats-grid risk-summary-grid">


            <div className="stat-card">

              <div className="stat-icon green">
                🟢
              </div>

              <div>

                <span className="stat-label">
                  ALLOW
                </span>

                <strong>
                  {formatNumber(
                    riskSummary.allow
                  )}
                </strong>

                <small>
                  Low-risk transactions
                </small>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon purple">
                🟡
              </div>

              <div>

                <span className="stat-label">
                  REVIEW
                </span>

                <strong>
                  {formatNumber(
                    riskSummary.review
                  )}
                </strong>

                <small>
                  Transactions requiring
                  verification
                </small>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon red">
                🔴
              </div>

              <div>

                <span className="stat-label">
                  BLOCK
                </span>

                <strong className="danger-number">
                  {formatNumber(
                    riskSummary.block
                  )}
                </strong>

                <small>
                  Critical-risk transactions
                </small>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon blue">
                🛡️
              </div>

              <div>

                <span className="stat-label">
                  TOTAL
                </span>

                <strong>
                  {formatNumber(
                    riskSummary.total
                  )}
                </strong>

                <small>
                  Transactions assessed
                </small>

              </div>

            </div>


          </div>


          <div
            className="panel"
            style={{
              marginTop: "24px",
            }}
          >

            <div className="panel-header">

              <div>

                <span className="panel-label">
                  DECISION DISTRIBUTION
                </span>

                <h3>
                  Risk Engine Decisions
                </h3>

              </div>

              <div className="panel-icon">
                🛡️
              </div>

            </div>


            <div className="chart-container large">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={riskChartData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                  />

                  <YAxis
                    type="category"
                    dataKey="decision"
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Transactions"
                    radius={[
                      0,
                      7,
                      7,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          HIGH-RISK ALERTS
          ===================================================== */}

      <section className="section">

        <div className="section-heading">

          <span className="section-tag danger">
            SECURITY ALERTS
          </span>

          <h2>
            🚨 High-Risk Alerts
          </h2>

          <p>
            Highest-risk transactions detected by
            the FraudShield AI engine.
          </p>

        </div>


        <div className="alert-panel">


          <div className="alert-panel-header">

            <div>

              <span className="alert-count">

                {highRisk.length}
                {" "}
                top alerts displayed

              </span>

              <h3>
                Critical &amp; Suspicious
                Transactions
              </h3>

            </div>


            <button
              className="refresh-button"
              onClick={loadDashboard}
            >
              🔄 Refresh
            </button>

          </div>


          {highRisk.length === 0 ? (

            <div className="empty-state">

              No high-risk transactions found.

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Transaction ID
                    </th>

                    <th>
                      Fraud Probability
                    </th>

                    <th>
                      Risk Score
                    </th>

                    <th>
                      Risk Level
                    </th>

                    <th>
                      Decision
                    </th>

                    <th>
                      Reason
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {highRisk.map(
                    (transaction, index) => (

                      <tr
                        key={
                          transaction.transaction_id ??
                          index
                        }
                      >

                        <td>

                          <strong>
                            #
                            {
                              transaction.transaction_id
                            }
                          </strong>

                        </td>


                        <td>

                          <strong>
                            {formatProbability(
                              transaction.fraud_probability
                            )}
                          </strong>

                        </td>


                        <td>

                          {Number(
                            transaction.risk_score
                          ).toFixed(2)}

                        </td>


                        <td>

                          <span
                            className={`risk-badge ${getRiskClass(
                              transaction.risk_decision
                            )}`}
                          >

                            {
                              transaction.risk_level
                            }

                          </span>

                        </td>


                        <td>

                          <span
                            className={`decision ${getRiskClass(
                              transaction.risk_decision
                            )}`}
                          >

                            {transaction.risk_decision ===
                              "ALLOW" &&
                              "🟢 "}

                            {transaction.risk_decision ===
                              "REVIEW" &&
                              "🟡 "}

                            {transaction.risk_decision ===
                              "BLOCK" &&
                              "🔴 "}

                            {
                              transaction.risk_decision
                            }

                          </span>

                        </td>


                        <td>

                          <span>
                            {
                              transaction.reason ||
                              "High-risk transaction detected."
                            }
                          </span>

                        </td>


                        <td>

                          <button
                            className="analyze-button"
                            onClick={() => {

                              setTransactionId(
                                transaction.transaction_id
                              );

                              analyzeTransaction(
                                transaction.transaction_id
                              );

                            }}
                          >
                            Analyze
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          TRANSACTION MONITORING
          ===================================================== */}

      <section className="section">

        <div className="section-heading">

          <span className="section-tag">
            TRANSACTION MONITORING
          </span>

          <h2>
            Recent Transaction Activity
          </h2>

          <p>
            Monitor transaction risk decisions
            generated by the FraudShield AI engine.
          </p>

        </div>


        <div className="monitor-panel">


          <div className="monitor-header">

            <div className="filter-buttons">


              <button
                className={`filter-button ${
                  riskFilter === "ALL"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setRiskFilter("ALL")
                }
              >
                All
              </button>


              <button
                className={`filter-button allow ${
                  riskFilter === "ALLOW"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setRiskFilter("ALLOW")
                }
              >
                🟢 Allow
              </button>


              <button
                className={`filter-button review ${
                  riskFilter === "REVIEW"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setRiskFilter("REVIEW")
                }
              >
                🟡 Review
              </button>


              <button
                className={`filter-button block ${
                  riskFilter === "BLOCK"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setRiskFilter("BLOCK")
                }
              >
                🔴 Block
              </button>


            </div>


            <button
              className="refresh-button"
              onClick={loadDashboard}
            >
              🔄 Refresh
            </button>

          </div>


          <div className="monitor-status">

            <span className="status-dot"></span>

            Monitoring Active

          </div>


          {transactions.length === 0 ? (

            <div className="empty-state">

              No transactions found for this
              filter.

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Transaction ID
                    </th>

                    <th>
                      Fraud Probability
                    </th>

                    <th>
                      Risk Score
                    </th>

                    <th>
                      Risk Level
                    </th>

                    <th>
                      Decision
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {transactions.map(
                    (transaction, index) => {

                      const decisionClass =
                        getRiskClass(
                          transaction.risk_decision
                        );

                      return (

                        <tr
                          key={
                            transaction.transaction_id ??
                            index
                          }
                        >

                          <td>

                            <strong>
                              #
                              {
                                transaction.transaction_id
                              }
                            </strong>

                          </td>


                          <td>

                            {formatProbability(
                              transaction.fraud_probability
                            )}

                          </td>


                          <td>

                            <div className="risk-score">

                              <span>

                                {Number(
                                  transaction.risk_score
                                ).toFixed(2)}

                              </span>


                              <div className="mini-bar">

                                <div
                                  className={`mini-bar-fill ${getRiskFillClass(
                                    transaction.risk_decision
                                  )}`}
                                  style={{
                                    width: `${Math.min(
                                      Number(
                                        transaction.risk_score
                                      ),
                                      100
                                    )}%`,
                                  }}
                                ></div>

                              </div>

                            </div>

                          </td>


                          <td>

                            <span
                              className={`risk-badge ${decisionClass}`}
                            >

                              {
                                transaction.risk_level
                              }

                            </span>

                          </td>


                          <td>

                            <span
                              className={`decision ${decisionClass}`}
                            >

                              {decisionClass ===
                                "allow" &&
                                "🟢 "}

                              {decisionClass ===
                                "review" &&
                                "🟡 "}

                              {decisionClass ===
                                "block" &&
                                "🔴 "}

                              {
                                transaction.risk_decision
                              }

                            </span>

                          </td>


                          <td>

                            <button
                              className="analyze-button"
                              onClick={() => {

                                setTransactionId(
                                  transaction.transaction_id
                                );

                                analyzeTransaction(
                                  transaction.transaction_id
                                );

                              }}
                            >
                              Analyze
                            </button>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}


          <div className="table-footer">

            Showing up to 20 transactions from
            the FraudShield AI monitoring engine.

          </div>

        </div>

      </section>


      {/* =====================================================
          TRANSACTION ANALYSIS
          ===================================================== */}

      <section className="section">

        <div className="section-heading">

          <span className="section-tag">
            TRANSACTION ANALYSIS
          </span>

          <h2>
            Analyze Transaction
          </h2>

          <p>
            Enter a transaction number to analyze
            its fraud risk using the FraudShield AI
            model.
          </p>

        </div>


        <div className="analysis-panel">


          <div className="input-area">

            <label htmlFor="transactionId">
              Transaction Number
            </label>


            <div className="input-row">

              <input
                id="transactionId"
                type="number"
                min="0"
                max="284806"
                value={transactionId}
                onChange={(event) =>
                  setTransactionId(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (event.key === "Enter") {
                    analyzeTransaction();
                  }

                }}
                placeholder="Enter transaction number"
              />


              <button
                className="primary-button"
                onClick={() =>
                  analyzeTransaction()
                }
                disabled={analysisLoading}
              >

                {analysisLoading
                  ? "Analyzing..."
                  : "🤖 Analyze Transaction"}

              </button>

            </div>


            <small>
              Valid transaction range: 0 – 284806
            </small>

          </div>


          {/* ANALYSIS RESULT */}

          {analysisResult && (

            <div className="result-card">


              <div className="result-header">

                <div>

                  <span className="result-label">
                    AI DETECTION RESULT
                  </span>

                  <h3>
                    Transaction #
                    {
                      analysisResult.transaction_id
                    }
                  </h3>

                </div>


                <div
                  className={`large-decision ${getRiskClass(
                    analysisResult.risk_decision
                  )}`}
                >

                  {analysisResult.risk_decision ===
                    "ALLOW" &&
                    "🟢 "}

                  {analysisResult.risk_decision ===
                    "REVIEW" &&
                    "🟡 "}

                  {analysisResult.risk_decision ===
                    "BLOCK" &&
                    "🔴 "}

                  {
                    analysisResult.risk_decision
                  }

                </div>

              </div>


              <div className="risk-display">

                <div className="risk-number">

                  <span>
                    Fraud Probability
                  </span>

                  <strong>
                    {formatProbability(
                      analysisResult.fraud_probability
                    )}
                  </strong>

                </div>


                <div className="risk-meter">

                  <div
                    className="risk-meter-fill"
                    style={{
                      width: `${Math.min(
                        Number(
                          analysisResult.fraud_probability
                        ),
                        100
                      )}%`,
                    }}
                  ></div>

                </div>

              </div>


              <div className="result-details">


                <div>

                  <span>
                    Risk Score
                  </span>

                  <strong>
                    {Number(
                      analysisResult.risk_score
                    ).toFixed(2)}
                  </strong>

                </div>


                <div>

                  <span>
                    Risk Level
                  </span>

                  <strong>
                    {
                      analysisResult.risk_level
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Decision
                  </span>

                  <strong>
                    {
                      analysisResult.risk_decision
                    }
                  </strong>

                </div>


              </div>


              <div className="reason-box">

                <strong>
                  Risk Assessment
                </strong>

                <p>
                  {
                    analysisResult.reason ||
                    "Transaction analyzed by the FraudShield AI risk engine."
                  }
                </p>

              </div>


              {/* SHAP */}

              {analysisResult.shap_explanation &&
                analysisResult.shap_explanation
                  .length > 0 && (

                  <div className="shap-section">

                    <div className="shap-header">

                      <span>
                        EXPLAINABLE AI
                      </span>

                      <h3>
                        Top Factors Influencing
                        This Decision
                      </h3>

                    </div>


                    <div className="shap-list">

                      {analysisResult.shap_explanation.map(
                        (factor, index) => (

                          <div
                            className="shap-item"
                            key={`${factor.feature}-${index}`}
                          >

                            <span>
                              {
                                factor.feature
                              }
                            </span>

                            <strong>

                              {Number(
                                factor.shap_value
                              ) > 0
                                ? "+"
                                : ""}

                              {Number(
                                factor.shap_value
                              ).toFixed(6)}

                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          FEATURES
          ===================================================== */}

      <section className="features-section">


        <div className="feature">

          <div className="feature-icon">
            🤖
          </div>

          <h3>
            AI Detection
          </h3>

          <p>
            Machine learning powered fraud
            prediction with explainable AI.
          </p>

        </div>


        <div className="feature">

          <div className="feature-icon">
            ⚡
          </div>

          <h3>
            Real-Time Analysis
          </h3>

          <p>
            Analyze transactions instantly through
            the FastAPI backend.
          </p>

        </div>


        <div className="feature">

          <div className="feature-icon">
            🛡️
          </div>

          <h3>
            Risk Intelligence
          </h3>

          <p>
            Intelligent ALLOW, REVIEW and BLOCK
            decisions.
          </p>

        </div>


      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer>

        FraudShield AI • Real-Time Fraud Detection
        &amp; Risk Intelligence Platform

      </footer>

    </div>
  );
}

export default App;