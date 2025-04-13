import joblib
import pandas as pd
from datetime import datetime


def predict_price(product, date):
    # Load the combined model
    model = joblib.load("models/fuel_price_model.joblib")

    # Read data for current price
    data = pd.read_csv(f"datasets/{product}.csv")
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

    # Add volume feature
    input_data["volume"] = 1000  # Example: Assume constant volume

    # Add fuel type dummy variables
    input_data["fuel_type_ethanol"] = 1 if product == "ethanol" else 0
    input_data["fuel_type_petrol"] = 1 if product == "petrol" else 0
    input_data["fuel_type_diesel"] = 1 if product == "diesel" else 0

    # Define features in same order as training
    features = [
        "volume",
        "month",
        "day_of_week",
        "year",
        "days_since_start",
        "fuel_type_ethanol",
        "fuel_type_petrol",
        "fuel_type_diesel",
    ]

    # Make prediction for the given date
    predicted_price = model.predict(input_data[features])

    # Get current price from the latest entry in the dataset
    current_price = data["price"].iloc[-1]

    return predicted_price[0], current_price
