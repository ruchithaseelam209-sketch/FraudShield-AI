import pandas as pd
import numpy as np
import joblib
import shap

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ============================================================
# FRAUDSHIELD AI
# Real-Time Fraud Detection & Risk Intelligence API
# ============================================================


# ============================================================
# 1. CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="FraudShield AI",
    description="AI-powered fraud detection and risk intelligence platform",
    version="2.1.0"
)


# ============================================================
# 2. CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://fraudshield-ai-frontend-azure.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 3. LOAD MODEL, SCALER AND DATASET
# ============================================================

MODEL_PATH = "models/fraud_model.pkl"
SCALER_PATH = "models/scaler.pkl"
DATA_PATH = "data/creditcard.csv.gz"


model = joblib.load(MODEL_PATH)

scaler = joblib.load(SCALER_PATH)

df = pd.read_csv(DATA_PATH)

X = df.drop("Class", axis=1)

y = df["Class"]


# ============================================================
# 4. MODEL PERFORMANCE
# ============================================================

MODEL_METRICS = {
    "roc_auc": 0.9721,
    "pr_auc": 0.7190,
    "fraud_recall": 0.91
}


# ============================================================
# 5. GENERATE MODEL PROBABILITIES
# ============================================================

def generate_all_probabilities():

    X_scaled = scaler.transform(X)

    probabilities = []

    batch_size = 10000

    for start in range(
        0,
        len(X_scaled),
        batch_size
    ):

        end = start + batch_size

        batch = X_scaled[start:end]

        batch_probability = model.predict_proba(
            batch
        )[:, 1]

        probabilities.extend(
            batch_probability
        )

    return np.array(
        probabilities
    )


print(
    "Generating fraud probabilities..."
)

all_probabilities = (
    generate_all_probabilities()
)

print(
    "Fraud probabilities generated successfully!"
)


# ============================================================
# 6. RISK INTELLIGENCE ENGINE
# ============================================================

def risk_intelligence(
    probability
):

    probability = float(
        probability
    )

    risk_score = round(
        probability * 100,
        2
    )

    if probability >= 0.70:

        risk_level = "CRITICAL"

        risk_decision = "BLOCK"

        reason = (
            "Very high probability of "
            "fraudulent activity."
        )

    elif probability >= 0.30:

        risk_level = "HIGH"

        risk_decision = "REVIEW"

        reason = (
            "Transaction requires "
            "additional verification."
        )

    else:

        risk_level = "LOW"

        risk_decision = "ALLOW"

        reason = (
            "Transaction appears to have "
            "low fraud risk."
        )

    return {

        "risk_score":
            risk_score,

        "risk_level":
            risk_level,

        "risk_decision":
            risk_decision,

        "reason":
            reason
    }


# ============================================================
# 7. TRANSACTION MODEL
# ============================================================

class Transaction(BaseModel):

    transaction_id: int


# ============================================================
# 8. ANALYZE TRANSACTION HELPER
# ============================================================

def analyze_transaction(
    transaction_id
):

    if (
        transaction_id < 0
        or
        transaction_id >= len(X)
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                f"Transaction ID must be "
                f"between 0 and {len(X) - 1}."
            )
        )

    probability = float(
        all_probabilities[
            transaction_id
        ]
    )

    risk_info = risk_intelligence(
        probability
    )

    return {

        "transaction_id":
            transaction_id,

        "fraud_probability":
            round(
                probability * 100,
                2
            ),

        "risk_score":
            risk_info[
                "risk_score"
            ],

        "risk_level":
            risk_info[
                "risk_level"
            ],

        "risk_decision":
            risk_info[
                "risk_decision"
            ],

        "reason":
            risk_info[
                "reason"
            ]
    }


# ============================================================
# 9. ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {

        "project":
            "FraudShield AI",

        "status":
            "online",

        "version":
            "2.1.0",

        "message":
            "Fraud detection API is running successfully."
    }


# ============================================================
# 10. DATASET STATISTICS
# ============================================================

@app.get("/stats")
def get_stats():

    total_transactions = len(df)

    fraud_transactions = int(
        y.sum()
    )

    legitimate_transactions = int(
        total_transactions -
        fraud_transactions
    )

    fraud_rate = round(
        (
            fraud_transactions /
            total_transactions
        ) * 100,
        2
    )

    return {

        "total_transactions":
            total_transactions,

        "fraud_transactions":
            fraud_transactions,

        "legitimate_transactions":
            legitimate_transactions,

        "fraud_rate":
            fraud_rate
    }


# ============================================================
# 11. ANALYTICS
# ============================================================

@app.get("/analytics")
def get_analytics():

    total_transactions = len(df)

    fraud_transactions = int(
        y.sum()
    )

    legitimate_transactions = int(
        total_transactions -
        fraud_transactions
    )

    return {

        "transaction_distribution": {

            "total":
                total_transactions,

            "legitimate":
                legitimate_transactions,

            "fraud":
                fraud_transactions
        },

        "model_performance": {

            "roc_auc":
                MODEL_METRICS[
                    "roc_auc"
                ],

            "pr_auc":
                MODEL_METRICS[
                    "pr_auc"
                ],

            "fraud_recall":
                MODEL_METRICS[
                    "fraud_recall"
                ]
        }
    }


# ============================================================
# 12. TRANSACTION MONITORING
# ============================================================

@app.get("/transactions")
def get_transactions(
    limit: int = 20,
    risk_filter: str = "ALL"
):

    if (
        limit < 1
        or
        limit > 100
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Limit must be between "
                "1 and 100."
            )
        )

    risk_filter = risk_filter.upper()

    valid_filters = [
        "ALL",
        "ALLOW",
        "REVIEW",
        "BLOCK"
    ]

    if risk_filter not in valid_filters:

        raise HTTPException(
            status_code=400,
            detail="Invalid risk filter."
        )

    transactions = []

    for transaction_id in range(
        len(all_probabilities)
    ):

        probability = float(
            all_probabilities[
                transaction_id
            ]
        )

        risk_info = risk_intelligence(
            probability
        )

        if (
            risk_filter != "ALL"
            and
            risk_info[
                "risk_decision"
            ] != risk_filter
        ):

            continue

        transactions.append({

            "transaction_id":
                transaction_id,

            "fraud_probability":
                round(
                    probability * 100,
                    2
                ),

            "risk_score":
                risk_info[
                    "risk_score"
                ],

            "risk_level":
                risk_info[
                    "risk_level"
                ],

            "risk_decision":
                risk_info[
                    "risk_decision"
                ]
        })

        if (
            len(transactions)
            >= limit
        ):

            break

    return {

        "count":
            len(transactions),

        "transactions":
            transactions
    }


# ============================================================
# 13. HIGH-RISK ALERTS
# ============================================================

@app.get("/high-risk")
def get_high_risk_transactions(
    limit: int = 10
):

    if (
        limit < 1
        or
        limit > 100
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Limit must be between "
                "1 and 100."
            )
        )

    high_risk_transactions = []

    for (
        transaction_id,
        probability
    ) in enumerate(
        all_probabilities
    ):

        probability = float(
            probability
        )

        if probability < 0.30:

            continue

        risk_info = risk_intelligence(
            probability
        )

        high_risk_transactions.append({

            "transaction_id":
                transaction_id,

            "fraud_probability":
                round(
                    probability * 100,
                    2
                ),

            "risk_score":
                risk_info[
                    "risk_score"
                ],

            "risk_level":
                risk_info[
                    "risk_level"
                ],

            "risk_decision":
                risk_info[
                    "risk_decision"
                ],

            "reason":
                risk_info[
                    "reason"
                ]
        })

    high_risk_transactions.sort(
        key=lambda item:
            item[
                "fraud_probability"
            ],
        reverse=True
    )

    top_alerts = (
        high_risk_transactions[
            :limit
        ]
    )

    return {

        "total_high_risk":
            len(
                high_risk_transactions
            ),

        "alerts":
            top_alerts
    }


# ============================================================
# 14. RISK SUMMARY
# ============================================================

@app.get("/risk-summary")
def get_risk_summary():

    allow_count = 0

    review_count = 0

    block_count = 0

    for probability in (
        all_probabilities
    ):

        probability = float(
            probability
        )

        if probability >= 0.70:

            block_count += 1

        elif probability >= 0.30:

            review_count += 1

        else:

            allow_count += 1

    return {

        "allow":
            allow_count,

        "review":
            review_count,

        "block":
            block_count,

        "total":
            (
                allow_count +
                review_count +
                block_count
            )
    }


# ============================================================
# 15. SINGLE TRANSACTION PREDICTION
# ============================================================

@app.post("/predict")
def predict_transaction(
    transaction: Transaction
):

    transaction_id = (
        transaction.transaction_id
    )

    if (
        transaction_id < 0
        or
        transaction_id >= len(X)
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                f"Transaction ID must be "
                f"between 0 and {len(X) - 1}."
            )
        )

    # --------------------------------------------------------
    # Get transaction
    # --------------------------------------------------------

    transaction_data = X.iloc[
        [transaction_id]
    ]


    # --------------------------------------------------------
    # Scale transaction
    # --------------------------------------------------------

    transaction_scaled = (
        scaler.transform(
            transaction_data
        )
    )


    # --------------------------------------------------------
    # Predict probability
    # --------------------------------------------------------

    probability = float(
        model.predict_proba(
            transaction_scaled
        )[0][1]
    )


    # --------------------------------------------------------
    # Risk intelligence
    # --------------------------------------------------------

    risk_info = risk_intelligence(
        probability
    )


    # ========================================================
    # SHAP EXPLANATION
    # ========================================================

    top_features = []

    try:

        # ----------------------------------------------------
        # Prepare background data
        # ----------------------------------------------------

        background_data = scaler.transform(
            X.iloc[:1000]
        )


        # ----------------------------------------------------
        # Create SHAP Linear Explainer
        # ----------------------------------------------------

        explainer = shap.LinearExplainer(
            model,
            background_data
        )


        # ----------------------------------------------------
        # Calculate SHAP values
        # ----------------------------------------------------

        shap_result = explainer(
            transaction_scaled
        )


        values = np.asarray(
            shap_result.values
        )


        # ----------------------------------------------------
        # Handle SHAP output dimensions
        # ----------------------------------------------------

        if values.ndim == 2:

            shap_values_row = (
                values[0]
            )

        elif values.ndim == 1:

            shap_values_row = values

        else:

            shap_values_row = (
                values.reshape(-1)
            )


        # ----------------------------------------------------
        # Feature names
        # ----------------------------------------------------

        feature_names = list(
            X.columns
        )


        # ----------------------------------------------------
        # Create feature impacts
        # ----------------------------------------------------

        feature_impacts = []

        for (
            feature_name,
            impact
        ) in zip(
            feature_names,
            shap_values_row
        ):

            impact = float(
                impact
            )

            # Ignore invalid numerical values
            if not np.isfinite(
                impact
            ):

                continue

            feature_impacts.append({

                "feature":
                    feature_name,

                # IMPORTANT:
                # React expects "shap_value"
                "shap_value":
                    round(
                        impact,
                        6
                    )
            })


        # ----------------------------------------------------
        # Sort by absolute SHAP impact
        # ----------------------------------------------------

        feature_impacts.sort(
            key=lambda item:
                abs(
                    item[
                        "shap_value"
                    ]
                ),
            reverse=True
        )


        # ----------------------------------------------------
        # Select top 5 features
        # ----------------------------------------------------

        top_features = (
            feature_impacts[:5]
        )


    except Exception as error:

        print(
            "SHAP explanation error:",
            error
        )

        top_features = []


    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "transaction_id":
            transaction_id,

        "fraud_probability":
            round(
                probability * 100,
                2
            ),

        "risk_score":
            risk_info[
                "risk_score"
            ],

        "risk_level":
            risk_info[
                "risk_level"
            ],

        "risk_decision":
            risk_info[
                "risk_decision"
            ],

        "reason":
            risk_info[
                "reason"
            ],

        "shap_explanation":
            top_features
    }


# ============================================================
# END OF APPLICATION
# ============================================================