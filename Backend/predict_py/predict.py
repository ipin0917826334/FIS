from flask import Flask, request, jsonify
import pandas as pd
import itertools
from statsmodels.tsa.statespace.sarimax import SARIMAX
import warnings
from pandas.tseries.offsets import MonthBegin
from flask_cors import cross_origin

app = Flask(__name__)

@app.route('/forecast', methods=['POST'])
@cross_origin() 
def forecast():
    # Extract JSON data from the request
    data = request.json
    
    # Extract the fruit name and the forecast period from the request
    fruit_name = data['fruit_name']
    input_year = data['forecast_year']
    input_month = data['forecast_month']
    
    # Read the specific sheet for the fruit from Excel
    file_path = 'data.xlsx'  # Ensure this path is correct
    df = pd.read_excel(file_path, sheet_name=fruit_name, engine='openpyxl')
    
    # Convert Buddhist year to Gregorian year by subtracting 543
    df['Year'] = df['Year'] - 543

    # Assuming the second column in your Excel file contains the Thai month names
    thai_months = {
        'มกราคม': 1,      # January
        'กุมภาพันธ์': 2,   # February
        'มีนาคม': 3,       # March
        'เมษายน': 4,       # April
        'พฤษภาคม': 5,      # May
        'มิถุนายน': 6,      # June
        'กรกฎาคม': 7,      # July
        'สิงหาคม': 8,      # August
        'กันยายน': 9,      # September
        'ตุลาคม': 10,      # October
        'พฤศจิกายน': 11,   # November
        'ธันวาคม': 12       # December
    }
    df['Month'] = df.iloc[:, 1]  # Adjust the index if necessary
    df['Month_Number'] = df['Month'].map(thai_months)

    # Combine year and month to a datetime, setting day to the first of the month
    df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month_Number'].astype(str).str.zfill(2), format='%Y-%m')

    # Set the datetime as the index
    df.set_index('Date', inplace=True)

    # Manually set the frequency to month start ('MS')
    df.index.freq = 'MS'

    # Assuming the third column in your Excel file contains the Sales_Volume data
    df['Sales_Volume'] = df.iloc[:, 2]  # Adjust the index if necessary

    # Define the p, d, and q parameters to take values between 0 and 2
    p = d = q = range(0, 3)

    # Generate all different combinations of p, d, and q triplets
    pdq = list(itertools.product(p, d, q))

    # Grid Search
    best_aic = float('inf')
    best_pdq = None
    best_model = None

    warnings.filterwarnings("ignore")  # Ignore warning messages for model

    for param in pdq:
        try:
            model = SARIMAX(df['Sales_Volume'], order=param, seasonal_order=(1, 0, 1, 12))
            results = model.fit()
            
            # Compare AIC
            if results.aic < best_aic:
                best_aic = results.aic
                best_pdq = param
                best_model = results
        except Exception as e:
            print(f"SARIMA{param} model failed to fit: {e}")
            continue

    warnings.resetwarnings()

    # Use the best model to forecast
    last_date = df.index[-1]
    input_year = int(input_year)  # Convert year from string to integer
    input_month = int(input_month)  # Convert month from string to integer
    target_date = pd.Timestamp(year=input_year, month=input_month, day=1)

    if target_date <= last_date:
        # If the target date is before or equal to the last date in the dataset, return actual data
        actual_sales_volume = df.loc[target_date, 'Sales_Volume'] if target_date in df.index else None
        response = {
            'actual_sales_volume': int(actual_sales_volume) if actual_sales_volume is not None else "Data not available"
        }
    else:
        # If the target date is after the last date in the dataset, perform forecasting
        steps_ahead = (input_year - last_date.year) * 12 + (input_month - last_date.month)
        forecast = best_model.get_forecast(steps_ahead)
        predicted_sales_volume = forecast.predicted_mean.iloc[-1]
        predicted_sales_volume = max(0, predicted_sales_volume)
        response = {'forecasted_sales_volume': int(predicted_sales_volume)}

    return jsonify(response)

@app.route('/get-fruits', methods=['GET'])
@cross_origin() 
def get_fruits():
    file_path = 'data.xlsx'
    xls = pd.ExcelFile(file_path, engine='openpyxl')
    sheet_names = xls.sheet_names
    print(sheet_names)
    return jsonify(sheet_names)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
