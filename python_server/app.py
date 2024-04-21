from flask import Flask, jsonify, request
from snowflake import connector
import pandas as pd
import transformers
from transformers import AutoTokenizer

app = Flask(__name__)

"""
* https://learn.microsoft.com/en-us/azure/app-service/quickstart-python?tabs=flask%2Cwindows%2Cazure-cli%2Cazure-cli-deploy%2Cdeploy-instructions-azportal%2Cterminal-bash%2Cdeploy-instructions-zip-azcli

* http://athena-flask-api.azurewebsites.net
"""

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

    conn = connector.connect(
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

@app.route('/snowflake/query', methods=['POST'])
def querySnowflake():
    credentials = request.get_json()
    user = credentials.get('username')
    password = credentials.get('password')
    account = credentials.get('account')
    warehouse = credentials.get('warehouse')
    database = credentials.get('database')
    schema = credentials.get('schema')
    query = credentials.get('query')

    conn = connector.connect(
    user=user,
    password=password,
    account=account,
    warehouse=warehouse,
    database=database,
    schema=schema
    )

    cur = conn.cursor()
    data = {}
    try:
        cur.execute(query)
        print(cur.description)
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in cur.fetchall()]
        print(data)
    finally:
        cur.close()
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True)
