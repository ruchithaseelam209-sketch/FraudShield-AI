import pandas as pd
import joblib


# 1. Load trained model and scaler
model = joblib.load("models/fraud_model.pkl")
scaler = joblib.load("models/scaler.pkl")

print("FraudShield AI loaded successfully!")


# 2. Load dataset
df = pd.read_csv("data/creditcard.csv")

# Remove target column
X = df.drop("Class", axis=1)


# 3. Ask user for transaction number
index = int(input("\nEnter transaction number (0-284806): "))

# Select transaction
transaction = X.iloc[[index]]


# 4. Scale transaction
transaction_scaled = scaler.transform(transaction)


# 5. Predict fraud probability
probability = model.predict_proba(transaction_scaled)[0][1]


# 6. Risk decision
if probability >= 0.70:
    decision = "BLOCK"

elif probability >= 0.30:
    decision = "REVIEW"

else:
    decision = "ALLOW"


# 7. Display result
print("\n===== FRAUDSHIELD RESULT =====")
print(f"Transaction Number: {index}")
print(f"Fraud Probability: {probability * 100:.2f}%")
print(f"Risk Decision: {decision}")