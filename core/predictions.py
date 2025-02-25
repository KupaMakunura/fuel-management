import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from datetime import datetime
from django.conf import settings
import os
from django.db.models import Sum
from django.db.models.functions import ExtractMonth, ExtractYear
from core.models import Inventory


class FuelConsumptionPredictor:
    def __init__(self):
        self.model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(self.model_dir, exist_ok=True)
        self.scaler = StandardScaler()

    def _get_model_path(self, product):
        return os.path.join(self.model_dir, f'{product}_consumption_model.joblib')

    def _get_scaler_path(self, product):
        return os.path.join(self.model_dir, f'{product}_scaler.joblib')

    def prepare_training_data(self, product):
        """Prepare historical data for training"""
        inventories = (Inventory.objects
                       .filter(name=product)
                       .annotate(
            month=ExtractMonth('created_at'),
            year=ExtractYear('created_at')
        )
                       .values('month', 'year')
                       .annotate(
            total_volume=Sum('volume')
        )
                       .order_by('year', 'month')
                       )

        if not inventories:
            raise ValueError(f"No historical data found for {product}")

        data = []
        for entry in inventories:
            # Create features: year, month, and any seasonal indicators
            time_value = entry['year'] * 12 + entry['month']
            month = entry['month']
            # Add seasonal features
            is_peak_season = 1 if month in [6, 7, 8] else 0  # Summer months
            is_holiday_season = 1 if month in [11, 12] else 0  # Holiday season

            data.append([
                time_value,
                month,
                is_peak_season,
                is_holiday_season,
                entry['total_volume']
            ])

        return np.array(data)

    def train_model(self, product):
        """Train and save the model for a specific product"""
        try:
            data = self.prepare_training_data(product)

            if len(data) < 6:  # Minimum data requirement
                raise ValueError("Insufficient data for training")

            X = data[:, :-1]  # Features
            y = data[:, -1]  # Target (volume)

            # Scale features
            X_scaled = self.scaler.fit_transform(X)

            # Train model
            model = LinearRegression()
            model.fit(X_scaled, y)

            # Save model and scaler
            joblib.dump(model, self._get_model_path(product))
            joblib.dump(self.scaler, self._get_scaler_path(product))

            return {
                'success': True,
                'message': f'Model for {product} trained successfully',
                'score': model.score(X_scaled, y)
            }

        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }

    def predict(self, product, months_ahead=6):
        """Make predictions using the saved model"""
        try:
            # Load model and scaler
            model = joblib.load(self._get_model_path(product))
            scaler = joblib.load(self._get_scaler_path(product))

            # Get last record date
            last_record = (Inventory.objects
                           .filter(name=product)
                           .latest('created_at'))

            last_date = datetime.combine(last_record.created_at.date(),
                                         datetime.min.time())

            # Generate future dates features
            predictions = []
            current_date = last_date

            for i in range(months_ahead):
                next_month = ((current_date.month + i) % 12) + 1
                next_year = current_date.year + ((current_date.month + i) // 12)

                time_value = next_year * 12 + next_month
                is_peak_season = 1 if next_month in [6, 7, 8] else 0
                is_holiday_season = 1 if next_month in [11, 12] else 0

                features = np.array([[
                    time_value,
                    next_month,
                    is_peak_season,
                    is_holiday_season
                ]])

                # Scale features and predict
                features_scaled = scaler.transform(features)
                predicted_volume = model.predict(features_scaled)[0]

                predictions.append({
                    'year': next_year,
                    'month': next_month,
                    'predicted_volume': round(float(predicted_volume), 2)
                })

            return {
                'success': True,
                'product': product,
                'predictions': predictions
            }

        except FileNotFoundError:
            return {
                'success': False,
                'message': f'Model not found for {product}. Train a model first.'
            }
