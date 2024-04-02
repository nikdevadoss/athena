from flask import Flask, jsonify, request
import snowflake.connector
import pandas as pd

app = Flask(__name__)


@app.route('/snowflake/connect', methods=['POST'])
def get_data():

    # Extract connection details from the request body
    data = request.get_json()
    user = data.get('username')
    password = data.get('password')
    account = data.get('account')
    warehouse = data.get('warehouse')
    database = data.get('database')
    schema = data.get('schema')

    conn = snowflake.connector.connect(
    user=user,
    password=password,
    account=account,
    warehouse=warehouse,
    database=database,
    schema=schema
    )

    cur = conn.cursor()
    structured_data = {}
    try:
        cur.execute("SELECT table_schema, table_name, column_name, data_type FROM information_schema.columns ORDER BY table_schema, table_name, ordinal_position")
        df = cur.fetch_pandas_all()
        grouped = df.groupby('TABLE_NAME')
        structured_data = {}
        # Iterate over each group
        for table_name, group in grouped:
            #Create a list of dictionaries for each column in the table
            columns_list = group[['COLUMN_NAME', 'DATA_TYPE']].to_dict('records')
            # Assign the list to the table_name key in structured_data
            structured_data[table_name] = columns_list
        # print(df)
    finally:
        cur.close()
    return jsonify(structured_data), 200
    

if __name__ == '__main__':
    app.run(debug=True)
