# FraudShield AI

An AI-powered **credit card fraud detection system** that analyzes transactions, assigns fraud risk scores, provides **ALLOW / REVIEW / BLOCK** decisions, and explains predictions using **SHAP explainability**.

## 🚀 Live Demo

**Frontend:**  
https://fraudshield-ai-frontend-azure.vercel.app/

**Backend API:**  
https://fraudshield-ai-e790.onrender.com/

---

## 📌 Project Overview

FraudShield AI is a full-stack machine learning application designed to detect potentially fraudulent credit card transactions.

The system combines:

- Machine Learning for fraud prediction
- FastAPI for backend APIs
- React + Vite for the dashboard
- SHAP for explainable AI
- Vercel for frontend deployment
- Render for backend deployment

The dashboard provides access to transaction statistics, model performance, high-risk alerts, risk distribution, and individual transaction predictions.

---

## ✨ Key Features

- 🔍 **Fraud Detection** using Logistic Regression
- 📊 **Interactive Analytics Dashboard**
- ⚠️ **Risk Classification**
  - LOW → ALLOW
  - HIGH → REVIEW
  - CRITICAL → BLOCK
- 🧠 **SHAP Explainability** for individual predictions
- 🚨 **High-Risk Transaction Alerts**
- 📈 **Model Performance Metrics**
- 📋 **Transaction Search and Filtering**
- 🔢 **Fraud Probability and Risk Score**
- 🌐 **Live Full-Stack Deployment**
- 🔌 **REST API using FastAPI**

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   Credit Card Data  │
                    │   creditcard.csv.gz  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Data Preprocessing   │
                    │ & Feature Scaling    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Logistic Regression │
                    │   Fraud Detection   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   SHAP Explainable  │
                    │         AI          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    │       Render        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + Vite        │
                    │ Analytics Dashboard │
                    │       Vercel        │
                    └─────────────────────┘---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Recharts
- CSS

### Backend

- Python
- FastAPI
- Uvicorn
- Pandas
- NumPy
- Joblib

### Machine Learning

- Scikit-learn
- Logistic Regression
- StandardScaler
- SHAP

### Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Version Control:** Git & GitHub

---

## 📂 Dataset

The project uses the **Credit Card Fraud Detection dataset** containing:

- **284,807 transactions**
- **492 fraudulent transactions**
- **284,315 legitimate transactions**
- **30 input features**

### Dataset Distribution

| Type | Count |
|---|---:|
| Legitimate | 284,315 |
| Fraud | 492 |
| Total | 284,807 |

The dataset is highly imbalanced, which is an important consideration when evaluating fraud detection models.

The dataset is stored in compressed form as:

```text
data/creditcard.csv.gz
