import joblib
import pandas as pd
from datetime import datetime


def predict_price(product, date):

    data = pd.read_csv(f"datasets/{product}.csv")
    # Load the saved model
    model = joblib.load(f"models/{product}_price_model.joblib")

    # convert the date to a datetime object
    data["created_at"] = pd.to_datetime(data["created_at"])

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

    # Make prediction for the given date
    predicted_price = model.predict(input_data[features])

    # Get current price from the latest entry in the dataset
    current_price = data["price"].iloc[-1]

    return predicted_price[0], current_price
