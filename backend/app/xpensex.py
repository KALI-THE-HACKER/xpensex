from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials

import mysql.connector as connector
from mysql.connector.errors import IntegrityError, DatabaseError

import time
from datetime import datetime, timedelta, date
import calendar
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
import json

load_dotenv()

# Configure logging
log_dir = Path("/app/logs")
log_dir.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / "backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# Initialize Firebase Admin SDK
# cred_dict = json.loads(os.getenv("FIREBASE_CREDENTIALS_JSON")) #Env var in Azure Key Vault
# firebase_config = {
#     "type": os.getenv("FIREBASE_TYPE"),
#     "project_id": os.getenv("FIREBASE_PROJECT_ID"),
#     "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
#     "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
#     "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
#     "client_id": os.getenv("FIREBASE_CLIENT_ID"),
#     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
#     "token_uri": "https://oauth2.googleapis.com/token",
#     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
#     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40xpensex-180dc.iam.gserviceaccount.com",
#     "universe_domain": "googleapis.com"
# }

cred = credentials.Certificate(os.getenv("FIREBASE_KEY"))
firebase_admin.initialize_app(cred)

app = FastAPI()
security = HTTPBearer()



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://xpensex.luckylinux.xyz", 
        "https://xpensex.luckylinux.xyz"
    ],  # frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dbconfig = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}

def get_db():
    cnx = connector.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    try:
        yield cnx
    finally:
        cnx.close()

colors = [
    "#845EC2",  # Neon Purple
    "#FF6B81",  # Neon Pink
    "#2C73D2",  # Strong Blue
    "#6BCB77",  # Fresh Green
    "#9B6DFF",  # Bright Violet
    "#FF4D6D",  # Hot Pink
    "#4D96FF",  # Sky Blue
    "#00FFAB",  # Neon Green
    "#B39CD0",  # Light Lavender
    "#FF85B3",  # Light Pink Glow
    "#00C9A7",  # Aqua Green
    "#FFD93D",  # Bright Gold
    "#DDB6F2",  # Soft Lilac
    "#FF8C42",  # Vibrant Orange
    "#6A4C93",  # Deep Violet
    "#F9F871",  # Neon Yellow
    "#A66DD4",  # Electric Purple
    "#A3E4DB",  # Mint Aqua
    "#C77DFF",  # Glow Violet
    "#E4C1F9"   # Pastel Purple
]



def getAllMonths(data):
    dates = [datetime.strptime(d, "%b %y") for d in data]
    if dates:
        start, end = min(dates), max(dates)
    else:
        return [0]

    all_months = []
    curr = start
    while curr <= end:
        all_months.append(curr.strftime("%b %y"))
        if curr.month == 12:
            curr = curr.replace(year=curr.year + 1, month=1)
        else:
            curr = curr.replace(month=curr.month + 1)
    return all_months

def format_expense_data_all(expense_data_rows, expense_period):
    data_dict = {}
    result_list = []

    #initialize all the months with 0 
    for row in expense_data_rows:
        category, month, total_amount = row["category"], row["month"], row["total_amount"]
        if category not in data_dict:
            data_dict[category] = {m:0 for m in expense_period}
    
    #Now fill actual values of data
    for row in expense_data_rows:
        category, month, total_amount = row["category"], row["month"], row["total_amount"]
        data_dict[category][month] = total_amount

    #Change format
    i=0
    for category in data_dict:
        result_list.append({"label": category, "data": [data_dict[category][m] for m in expense_period], "backgroundColor": colors[i % len(colors)]})
        i+=1 #Color index

    return result_list

def format_expense_data_current_month(expense_rows):
    temp_dict = {"labels" : [], "data": [], "backgroundColor": []}
    for row in expense_rows:
        temp_dict["labels"].append(row["category"])
        temp_dict["data"].append(row["total_amount"])
    
    temp_dict["backgroundColor"] = [colors[i % len(colors)] for i in range(len(temp_dict["labels"]))]


    return temp_dict

def format_transactions_data(transactions_data):
    temp_list = []
    i=0
    for row in transactions_data:
        i+=1
        temp_list.append({
            "id": row["id"],
            "category": row["category"],
            "amount": row["amount"],
            "type": row["type"],
            "date": row["date"],
            "description": row["description"]
        })

    return temp_list

def format_budget_data(target_data, current_data):
    temp_list = []
    for i in target_data:
        current_amount = next((j["current_amount"] for j in current_data if j["category"] == i["category"]), 0)

        temp_dict = {
            "id": i["id"],
            "category": i["category"],
            "targetAmount": i["amount"],
            "currentAmount": current_amount,
            "description": i["description"]
        }
        temp_list.append(temp_dict)

    return temp_list
def format_savings_data(target_data, current_data):
    temp_list = []
    for i in target_data:
        current_amount = next((j["current_amount"] for j in current_data if j["category"] == i["name"]), 0)

        temp_dict = {
            "id": i["id"],
            "name": i["name"],
            "targetAmount": i["amount"],
            "currentAmount": current_amount,
            "description": i["description"]
        }
        temp_list.append(temp_dict)

    return temp_list


@app.get("/health")
def health():
    logger.info("Health check endpoint called")
    return JSONResponse({'status': 'ok'}, status_code=200)


def verify_token(auth_creds: HTTPAuthorizationCredentials = Depends(security)):
    token = auth_creds.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        logger.info(f"Token verified successfully for user: {decoded_token.get('uid', 'unknown')}")
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.get("/wholeData")
def wholeData(db=Depends(get_db), user=Depends(verify_token)):
    logger.info(f"WholeData endpoint called for user: {user['uid']}")
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT DISTINCT category FROM transactions WHERE uid = %s AND type = %s", (user["uid"], "Expense"))
        expenseList = cursor.fetchall() #For category
        expenseList_formatted = {e["category"] for e in expenseList}

        #Extra categories for expense list from budget table
        cursor.execute("SELECT category FROM budget WHERE uid=%s;", (user["uid"],))
        for i in cursor.fetchall():
            if(i["category"] not in expenseList_formatted):
                expenseList_formatted.add(i["category"])
        expenseList_formatted = list(expenseList_formatted)

        cursor.execute("SELECT DISTINCT category FROM transactions WHERE uid = %s AND type = %s", (user["uid"], 'Income'))
        incomeList = cursor.fetchall() #For category
        incomeList_formatted = [e["category"] for e in incomeList]



        cursor.execute("SELECT name FROM savings WHERE uid = %s;", (user["uid"],))
        savingsList = cursor.fetchall() #For category
        savingsList_formatted = [e["name"] for e in savingsList]

        #Fetching expense data for all months
        cursor.execute("SELECT category, DATE_FORMAT(date, '%b %y') as month, SUM(amount) AS total_amount FROM transactions WHERE uid = %s AND type = %s GROUP BY category, month ORDER BY MIN(date)", (user["uid"], "Expense"))
        expense_data_rows = cursor.fetchall()

        months = [row["month"] for row in expense_data_rows]
        expense_period = getAllMonths(months)

        formatted_expense_data_all = format_expense_data_all(expense_data_rows, expense_period)

        #fetchind expense data for current month
        current_month = date.today().month
        current_year = date.today().year

        cursor.execute("SELECT category, SUM(amount) AS total_amount FROM transactions WHERE uid = %s AND type = %s AND MONTH(date) = %s AND YEAR(date) = %s GROUP BY category", (user["uid"], "Expense", current_month, current_year))
        
        expense_rows = cursor.fetchall()

        formatted_expense_data_current_month = format_expense_data_current_month(expense_rows)

        #Fetching income data for all months
        cursor.execute("SELECT category, DATE_FORMAT(date, '%b %y') as month, SUM(amount) AS total_amount FROM transactions WHERE uid = %s AND type = %s GROUP BY category, month ORDER BY MIN(date)", (user["uid"], "Income"))
        income_data_rows = cursor.fetchall()

        months = [row["month"] for row in income_data_rows]
        income_period = getAllMonths(months)

        formatted_income_data_all = format_expense_data_all(income_data_rows, income_period)

        #fetchind income data for current month
        current_month = date.today().month
        current_year = date.today().year

        cursor.execute("SELECT category, SUM(amount) AS total_amount FROM transactions WHERE uid = %s AND type = %s AND MONTH(date) = %s AND YEAR(date) = %s GROUP BY category", (user["uid"], "Income", current_month, current_year))
        
        income_rows = cursor.fetchall()

        formatted_income_data_current_month = format_expense_data_current_month(income_rows)
        
        #Fetching transactions
        cursor.execute("SELECT *, DATE_FORMAT(date, '%d %M') AS date FROM transactions WHERE uid=%s ORDER BY date DESC;", (user["uid"],))
        transactions_data = cursor.fetchall()

        transactions_data_formatted = format_transactions_data(transactions_data)

        #Finding total income so far this month
        total_income = 0
        for i in formatted_income_data_current_month["data"]:
            total_income+=i
        
        #Finding total expense so far this month
        total_expense = 0
        for i in formatted_expense_data_current_month["data"]:
            total_expense+=i

        #Fetching total savings so far this month
        cursor.execute("""
            SELECT COALESCE(SUM(amount), 0) AS total_savings
                FROM transactions
            WHERE uid=%s AND type=%s AND MONTH(date)=%s AND YEAR(date)=%s
        """, (user["uid"], "Savings", current_month, current_year))
        row = cursor.fetchone()
        total_savings = float(row["total_savings"])

        try:
            # Fetching data for budget goals
            cursor.execute("SELECT id, category, amount, description FROM budget WHERE uid=%s;", (user["uid"],))
            budget_data = cursor.fetchall()

            cursor.execute("""
                SELECT category, SUM(amount) as current_amount 
                FROM transactions 
                WHERE uid=%s AND type=%s AND MONTH(date)=%s AND YEAR(date)=%s 
                GROUP BY category;
            """, (user["uid"], "Expense", current_month, current_year))
            budget_current_data = cursor.fetchall()

            formatted_budget_data = format_budget_data(budget_data, budget_current_data) or []

            # fetching data for savings goals
            cursor.execute("SELECT id, name, amount, description FROM savings WHERE uid=%s;", (user["uid"],))
            savings_data = cursor.fetchall()

            cursor.execute("""
                SELECT category, SUM(amount) as current_amount 
                FROM transactions 
                WHERE uid=%s AND type=%s 
                GROUP BY category;
            """, (user["uid"], "Savings"))
            savings_current_data = cursor.fetchall()
        
            formatted_savings_data = format_savings_data(savings_data, savings_current_data) or []
        
        except Exception as e:
            print(e)


        wholeData = {
            "category": {
                "expense": expenseList_formatted,
                "income": incomeList_formatted,
                "savings": savingsList_formatted
            },
            "expensePeriod": expense_period,
            "expenseDataAll": formatted_expense_data_all,
            "expenseDataCurrentMonth": formatted_expense_data_current_month,
            "incomePeriod": income_period,
            "incomeDataAll": formatted_income_data_all,
            "incomeDataCurrentMonth": formatted_income_data_current_month,
            "transactions": transactions_data_formatted,
            "totalIncome": total_income,
            "totalExpense": total_expense,
            "balanceLeft": total_income-total_expense, 
            "totalSavings": total_savings,
            "budgetData": formatted_budget_data,
            "savingsData": formatted_savings_data
            
        }

        logger.info(f"WholeData successfully retrieved for user: {user['uid']}")
        return JSONResponse(content=jsonable_encoder(wholeData), status_code=200)

        
        
    except Exception as e:
        logger.error(f"Error in wholeData endpoint for user {user['uid']}: {str(e)}")
        return JSONResponse({'error': str(e)})
        


    # return JSONResponse({'wholeData': wholeData}, status_code=200)

@app.post("/AddTransaction")
async def addTransaction(request: Request, user=Depends(verify_token), db=Depends(get_db)):
    logger.info(f"AddTransaction endpoint called for user: {user['uid']}")
    cursor = db.cursor(dictionary=True)
    try:
        data = await request.json()
        if not data:
            raise HTTPException(status_code=422, detail="Incomplete data provided!")

        amount, transaction_type, category, date, description = data.get("amount"), data.get("type"), data.get("category"), data.get("date"), data.get("description") 

        try:
            if(transaction_type=="Savings"):
                cursor.execute("SELECT name FROM savings WHERE uid=%s;", (user["uid"],))
                savingsCategories = [row["name"] for row in cursor.fetchall()]
                if not (category in savingsCategories):
                    return JSONResponse({"detail": "First add category in savings"}, status_code=400)

            cursor.execute("INSERT INTO transactions (uid, amount, type, category, date, description) VALUES (%s, %s, %s, %s, %s, %s)", (user["uid"], amount, transaction_type, category, date, description))

            db.commit()
            cursor.close()
            logger.info(f"Transaction added successfully for user: {user['uid']}, type: {transaction_type}, category: {category}, amount: {amount}")
            return JSONResponse({"status": "Added!"}, status_code=200)
        except IntegrityError as e:
            logger.error(f"Database integrity error for user {user['uid']}: {str(e)}")
            print(e.errno, e)
    except Exception as e:
        logger.error(f"Error in addTransaction for user {user['uid']}: {str(e)}")
        print(e)

@app.post("/SetBudget")
async def setBudget(request: Request, user=Depends(verify_token), db=Depends(get_db)):
    logger.info(f"SetBudget endpoint called for user: {user['uid']}")
    cursor = db.cursor(dictionary=True)
    try:
        data = await request.json()
        if not all(key in data for key in ["category", "targetAmount"]):
            raise HTTPException(status_code=422, detail="Missing required fields")

        category = data["category"]
        amount = data["targetAmount"]
        description = data.get("description", "")
        
        cursor.execute(
            "INSERT INTO budget (uid, category, amount, description) VALUES (%s, %s, %s, %s)",
            (user["uid"], category, amount, description)
        )
        db.commit()
        
        logger.info(f"Budget goal added successfully for user: {user['uid']}, category: {category}, amount: {amount}")
        return JSONResponse({"status": "success", "message": "Budget goal added successfully"})
    except IntegrityError as e:
        logger.warning(f"Budget goal already exists for user {user['uid']}, category: {category}")
        return JSONResponse(
            {"status": "error", "detail": "Budget goal already exists for this category"},
            status_code=400
        )
    except Exception as e:
        logger.error(f"Error in setBudget for user {user['uid']}: {str(e)}")
        return JSONResponse(
            {"status": "error", "detail": str(e)},
            status_code=500
        )
    finally:
        cursor.close()

@app.delete("/DeleteBudget/{goalId}")
async def delete_budget(goalId: int, user=Depends(verify_token), db=Depends(get_db)):
    logger.info(f"DeleteBudget endpoint called for user: {user['uid']}, goalId: {goalId}")
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM budget WHERE uid=%s AND id=%s", (user["uid"], goalId))
        db.commit()

        if cursor.rowcount == 0:
            logger.warning(f"No budget goal found for deletion - user: {user['uid']}, goalId: {goalId}")
            return JSONResponse(
                {"status": "error", "detail": "No budget goal found or unauthorized."},
                status_code=404
            )

        logger.info(f"Budget goal deleted successfully for user: {user['uid']}, goalId: {goalId}")
        return JSONResponse({"status": "success", "detail": "Budget deleted"}, status_code=200)

    except Exception as e:
        logger.error(f"Error in delete_budget for user {user['uid']}: {str(e)}")
        return JSONResponse(
            {"status": "error", "detail": str(e)},
            status_code=500
        )



@app.post("/SetSavings")
async def setSavings(request: Request, user=Depends(verify_token), db=Depends(get_db)):
    logger.info(f"SetSavings endpoint called for user: {user['uid']}")
    cursor = db.cursor(dictionary=True)
    try:
        data = await request.json()
        if not all(key in data for key in ["name", "targetAmount"]):
            raise HTTPException(status_code=422, detail="Missing required fields")

        name = data["name"]
        amount = data["targetAmount"]
        description = data.get("description", "")
        
        cursor.execute(
            "INSERT INTO savings (uid, name, amount, description) VALUES (%s, %s, %s, %s)",
            (user["uid"], name, amount, description)
        )
        db.commit()
        
        logger.info(f"Savings goal added successfully for user: {user['uid']}, name: {name}, amount: {amount}")
        return JSONResponse({"status": "success", "message": "Savings goal added successfully"})
    except IntegrityError as e:
        logger.warning(f"Savings goal already exists for user {user['uid']}, name: {name}")
        return JSONResponse(
            {"status": "error", "detail": "Savings goal already exists for this category"},
            status_code=400
        )
    except Exception as e:
        logger.error(f"Error in setSavings for user {user['uid']}: {str(e)}")
        return JSONResponse(
            {"status": "error", "detail": str(e)},
            status_code=500
        )
    finally:
        cursor.close()
    
@app.delete("/DeleteSavingsGoal/{goalId}")
async def delete_saving(goalId: int, user=Depends(verify_token), db=Depends(get_db)):
    logger.info(f"DeleteSavingsGoal endpoint called for user: {user['uid']}, goalId: {goalId}")
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM savings WHERE uid=%s AND id=%s", (user["uid"], goalId))
        db.commit()

        if cursor.rowcount == 0:
            logger.warning(f"No savings goal found for deletion - user: {user['uid']}, goalId: {goalId}")
            return JSONResponse(
                {"status": "error", "detail": "No savings goal found or unauthorized."},
                status_code=404
            )

        logger.info(f"Savings goal deleted successfully for user: {user['uid']}, goalId: {goalId}")
        return JSONResponse({"status": "success", "detail": "Savings goal deleted"}, status_code=200)

    except Exception as e:
        logger.error(f"Error in delete_saving for user {user['uid']}: {str(e)}")
        return JSONResponse(
            {"status": "error", "detail": str(e)},
            status_code=500
        )