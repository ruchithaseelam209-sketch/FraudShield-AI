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
Current Risk Distribution
ALLOW     268,631
REVIEW     12,564
BLOCK       3,612
-------------------
TOTAL     284,807
---

## ⚠️ Limitations

This project is an **academic/prototype fraud detection system** and should not be treated as a production banking fraud prevention system.

Current limitations include:

- Highly imbalanced dataset
- Low fraud precision at the selected threshold
- Historical dataset rather than live banking transactions
- No real-time payment gateway integration
- No continuous model retraining
- No production authentication or authorization system
- Model performance may change on new transaction distributions
- Render free-tier backend may experience cold-start delays

---

## 🔮 Future Improvements

Possible future improvements include:

- Real-time transaction streaming
- Advanced models such as XGBoost or LightGBM
- Ensemble fraud detection
- Better handling of class imbalance
- Threshold optimization based on business cost
- Real-time alerts and notifications
- User authentication
- Transaction history for individual users
- Automated model retraining
- Model monitoring and drift detection
- Cloud database integration
- Production-grade security
- Advanced SHAP visualizations

---

## 🎯 Project Objective

The main objective of FraudShield AI is to demonstrate how **machine learning, explainable AI, backend APIs, and modern web technologies** can be combined to build an end-to-end fraud detection application.

The project focuses not only on predicting fraud but also on making predictions understandable through **risk decisions and SHAP-based explanations**.

---

## 👩‍💻 Author

**Ruchitha Seelam**

B.Tech – Artificial Intelligence & Data Science  
VVIT College of Engineering

### Profiles

- LinkedIn: https://linkedin.com/in/ruchitha-seelam-305233382
- GitHub: https://github.com/ruchithaseelam209-sketch
- CodeChef: https://codechef.com/users/vvit24bq1a54

---

## ⭐ Project

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**FraudShield AI — Detect. Explain. Protect.**
