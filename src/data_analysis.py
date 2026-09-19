import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score
)


# 1. Load dataset
df = pd.read_csv("data/creditcard.csv")

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)


# 2. Separate features and target
X = df.drop("Class", axis=1)
y = df["Class"]

print("X shape:", X.shape)
print("y shape:", y.shape)
print("Fraud cases:", y.sum())


# 3. Split data into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\nTraining data:", X_train.shape)
print("Testing data:", X_test.shape)
print("Fraud in training:", y_train.sum())
print("Fraud in testing:", y_test.sum())


# 4. Scale features
scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)


# 5. Create Logistic Regression model
model = LogisticRegression(
    class_weight="balanced",
    max_iter=1000
)


# 6. Train model
model.fit(X_train, y_train)

print("\nModel training completed!")


# 7. Save model and scaler
joblib.dump(model, "models/fraud_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")

print("Model saved successfully!")
print("Scaler saved successfully!")


# 8. Get fraud probabilities
y_probability = model.predict_proba(X_test)[:, 1]


# 9. Model performance
roc_auc = roc_auc_score(y_test, y_probability)
pr_auc = average_precision_score(y_test, y_probability)

print("\n===== MODEL PERFORMANCE =====")
print(f"ROC-AUC: {roc_auc:.4f}")
print(f"PR-AUC: {pr_auc:.4f}")


# 10. Test different thresholds
print("\n===== THRESHOLD ANALYSIS =====")

thresholds = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70]

for threshold in thresholds:

    y_pred = (y_probability >= threshold).astype(int)

    report = classification_report(
        y_test,
        y_pred,
        output_dict=True,
        zero_division=0
    )

    precision = report["1"]["precision"]
    recall = report["1"]["recall"]
    f1 = report["1"]["f1-score"]

    print(
        f"Threshold: {threshold:.2f} | "
        f"Precision: {precision:.2f} | "
        f"Recall: {recall:.2f} | "
        f"F1: {f1:.2f}"
    )


# 11. Final threshold
threshold = 0.70

y_pred = (y_probability >= threshold).astype(int)


# 12. Final evaluation
print("\n===== FINAL MODEL =====")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# 13. Risk Decision Engine
def risk_decision(probability):

    if probability >= 0.70:
        return "BLOCK"

    elif probability >= 0.30:
        return "REVIEW"

    else:
        return "ALLOW"


# 14. Show first 10 risk decisions
print("\n===== RISK DECISIONS =====")

for probability in y_probability[:10]:

    decision = risk_decision(probability)

    print(
        f"Risk: {probability * 100:.2f}% -> {decision}"
    )