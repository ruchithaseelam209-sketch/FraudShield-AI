# 🛡️ FraudShield AI

## AI-Powered Fraud Detection & Risk Intelligence Platform

FraudShield AI is a machine learning based fraud detection platform that analyzes financial transactions, estimates fraud probability, assigns risk levels, and provides explainable AI insights using SHAP.

The project combines a machine learning model, FastAPI backend, and React dashboard to provide an interactive fraud monitoring system.

---

## 🚀 Features

- 🤖 Machine Learning based fraud detection
- 📊 Real-time transaction risk analysis
- 🛡️ ALLOW, REVIEW and BLOCK decisions
- 🚨 High-risk transaction monitoring
- 📈 Model performance evaluation
- 🧮 Confusion Matrix visualization
- 🧠 Explainable AI using SHAP
- 📊 Transaction distribution analysis
- 🔍 Individual transaction analysis
- 🔄 Dashboard refresh functionality
- ⚡ FastAPI REST API
- 💻 React + Vite frontend
- 📱 Responsive dashboard interface

---

## 🏗️ System Architecture

```text
                 ┌──────────────────────┐
                 │   Credit Card Data   │
                 │    creditcard.csv    │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Machine Learning     │
                 │ Fraud Detection      │
                 │ Model                │
                 └──────────┬───────────┘
                            │
                     Prediction
                            │
                            ▼
                 ┌──────────────────────┐
                 │    FastAPI Backend   │
                 │                      │
                 │ Prediction API       │
                 │ Analytics API        │
                 │ Risk Engine          │
                 │ SHAP Explanation     │
                 └──────────┬───────────┘
                            │
                         REST API
                            │
                            ▼
                 ┌──────────────────────┐
                 │   React Dashboard    │
                 │                      │
                 │ Analytics            │
                 │ Risk Monitoring      │
                 │ Alerts               │
                 │ Transaction Analysis │
                 │ Explainable AI       │
                 └──────────────────────┘