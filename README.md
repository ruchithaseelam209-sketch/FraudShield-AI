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
                    │   creditcard.csv.gz │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Data Preprocessing  │
                    │ & Feature Scaling   │
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
                    │   FastAPI Backend   │
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
---

## 🤖 Machine Learning Model

FraudShield AI uses **Logistic Regression** for binary classification.

### Training Data

```text
Training samples: 227,845
Testing samples: 56,962
Fraud cases in training: 394
Fraud cases in testing: 98
The preprocessing pipeline includes feature scaling using `StandardScaler`.

The trained model and scaler are stored as:

```text
models/fraud_model.pkl
models/scaler.pkl
---

## 📊 Model Performance

The model achieved the following results on the test dataset:

| Metric | Score |
|---|---:|
| ROC-AUC | **0.9721** |
| PR-AUC | **0.7190** |
| Fraud Recall | **0.91** |
| Fraud Precision | **0.12** |
| Accuracy | **0.99** |

### Confusion Matrix

```text
                    Predicted
                  Legitimate  Fraud
Actual Legitimate    56219     645
Actual Fraud             9      89
---

## 📈 Dashboard Statistics

The dashboard provides:

```text
Total Transactions       284,807
Fraud Transactions           492
Legitimate Transactions  284,315
Fraud Rate                   0.17%

ROC-AUC                    0.9721
PR-AUC                     0.7190
Fraud Recall                  0.91
---

### Current Risk Distribution

```text
ALLOW     268,631
REVIEW     12,564
BLOCK       3,612
-------------------
TOTAL     284,807
---

## 🔌 API Endpoints

The FastAPI backend provides the following endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/` | GET | API status |
| `/stats` | GET | Dataset statistics |
| `/analytics` | GET | Analytics and model metrics |
| `/transactions` | GET | Transaction data |
| `/high-risk` | GET | High-risk transactions |
| `/risk-summary` | GET | Risk distribution |
| `/predict` | POST | Predict transaction risk |
| `/confusion-matrix` | GET | Model confusion matrix |

### Example API

```text
GET /
Response:

```json
{
  "project": "FraudShield AI",
  "status": "online",
  "version": "2.1.0",
  "message": "Fraud detection API is running successfully."
}
---

## 📁 Project Structure

```text
FraudShield-AI/
│
├── api/
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   └── creditcard.csv.gz
│
├── models/
│   ├── fraud_model.pkl
│   └── scaler.pkl
│
├── requirements.txt
├── README.md
└── .gitignore