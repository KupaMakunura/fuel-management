import joblib
import pandas as pd


def predict_price(product, date, data):
    # Load the saved model
    model = joblib.load(f"../models/{product}_price_model.joblib")

    # Prepare input data for the selected date
    input_data = pd.DataFrame({"created_at": [date]})

    # Add date-based features
    input_data["month"] = input_data["created_at"].dt.month
    input_data["day_of_week"] = input_data["created_at"].dt.dayofweek
    input_data["year"] = input_data["created_at"].dt.year
    input_data["days_since_start"] = (
        input_data["created_at"] - data["created_at"].min()
    ).dt.days

    # Add other features (e.g., volume)
    # For simplicity, assume constant volume or use a forecast for volume
    input_data["volume"] = 1000  # Example: Assume constant volume

    # Define features
    features = ["volume", "month", "day_of_week", "year", "days_since_start"]

    # Make prediction
    predicted_price = model.predict(input_data[features])
    return predicted_price[0]
