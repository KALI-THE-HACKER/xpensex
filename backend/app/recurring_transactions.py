"""
Recurring Transactions Module for XpenseX
Handles subscription detection, recurring transaction scheduling, and management.
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import mysql.connector as connector
from mysql.connector.errors import IntegrityError
from datetime import date, datetime, timedelta
import calendar
import logging
import json
from typing import Optional, List
from enum import Enum

logger = logging.getLogger(__name__)

# Frequency Enum
class RecurrenceFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

# Recurring Transaction Model
class RecurringTransactionCreate:
    def __init__(self, amount: int, type: str, category: str, frequency: str, 
                 start_date: date, end_date: Optional[date] = None, description: str = ""):
        self.amount = amount
        self.type = type
        self.category = category
        self.frequency = frequency
        self.start_date = start_date
        self.end_date = end_date
        self.description = description

def add_recurring_endpoints(app: FastAPI, security: HTTPBearer, get_db, verify_token):
    """Add recurring transaction endpoints to the FastAPI app."""
    
    @app.post("/recurring/Add")
    async def add_recurring_transaction(
        request: Request, 
        user=Depends(verify_token), 
        db=Depends(get_db)
    ):
        """Create a new recurring transaction."""
        logger.info(f"AddRecurringTransaction endpoint called for user: {user['uid']}")
        cursor = db.cursor(dictionary=True)
        try:
            data = await request.json()
            required_fields = ["amount", "type", "category", "frequency", "start_date"]
            if not all(key in data for key in required_fields):
                raise HTTPException(status_code=422, detail="Missing required fields")

            amount = data["amount"]
            transaction_type = data["type"]
            category = data["category"]
            frequency = data["frequency"]
            start_date = data["start_date"]
            end_date = data.get("end_date")
            description = data.get("description", "")

            # Validate frequency
            valid_frequencies = ["daily", "weekly", "monthly", "yearly"]
            if frequency not in valid_frequencies:
                raise HTTPException(status_code=400, detail=f"Invalid frequency. Must be one of: {valid_frequencies}")

            # Validate type
            valid_types = ["Income", "Expense", "Savings"]
            if transaction_type not in valid_types:
                raise HTTPException(status_code=400, detail=f"Invalid type. Must be one of: {valid_types}")

            # For Savings, verify category exists
            if transaction_type == "Savings":
                cursor.execute("SELECT name FROM savings WHERE uid=%s;", (user["uid"],))
                savings_categories = [row["name"] for row in cursor.fetchall()]
                if category not in savings_categories:
                    return JSONResponse({"detail": "First add category in savings"}, status_code=400)

            cursor.execute("""
                INSERT INTO recurring_transactions 
                (uid, amount, type, category, frequency, start_date, end_date, description, is_active, next_due_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (user["uid"], amount, transaction_type, category, frequency, start_date, end_date, description, True, start_date))

            db.commit()
            recurring_id = cursor.lastrowid
            cursor.close()
            
            logger.info(f"Recurring transaction added for user: {user['uid']}, id: {recurring_id}")
            return JSONResponse({"status": "Added!", "id": recurring_id}, status_code=200)
            
        except IntegrityError as e:
            logger.error(f"Database integrity error: {str(e)}")
            return JSONResponse({"detail": "Database error"}, status_code=500)
        except Exception as e:
            logger.error(f"Error in add_recurring_transaction: {str(e)}")
            return JSONResponse({"detail": str(e)}, status_code=500)

    @app.get("/recurring/List")
    async def list_recurring_transactions(user=Depends(verify_token), db=Depends(get_db)):
        """List all recurring transactions for the user."""
        cursor = db.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT id, amount, type, category, frequency, start_date, end_date, 
                       description, is_active, next_due_date, created_at
                FROM recurring_transactions 
                WHERE uid=%s ORDER BY created_at DESC
            """, (user["uid"],))
            recurring = cursor.fetchall()
            cursor.close()
            
            # Convert dates to strings
            for r in recurring:
                for key in ["start_date", "end_date", "next_due_date", "created_at"]:
                    if r[key]:
                        r[key] = r[key].isoformat()
            
            return JSONResponse(content=jsonable_encoder(recurring), status_code=200)
        except Exception as e:
            logger.error(f"Error listing recurring transactions: {str(e)}")
            return JSONResponse({"detail": str(e)}, status_code=500)

    @app.put("/recurring/Update/{recurring_id}")
    async def update_recurring_transaction(
        recurring_id: int,
        request: Request,
        user=Depends(verify_token),
        db=Depends(get_db)
    ):
        """Update a recurring transaction."""
        logger.info(f"UpdateRecurringTransaction called for user: {user['uid']}, id: {recurring_id}")
        cursor = db.cursor(dictionary=True)
        try:
            data = await request.json()
            
            # Build dynamic update query
            update_fields = []
            values = []
            allowed_fields = ["amount", "type", "category", "frequency", "start_date", "end_date", "description", "is_active"]
            
            for field in allowed_fields:
                if field in data:
                    update_fields.append(f"{field} = %s")
                    values.append(data[field])
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="No valid fields to update")
            
            values.extend([recurring_id, user["uid"]])
            query = f"UPDATE recurring_transactions SET {', '.join(update_fields)} WHERE id = %s AND uid = %s"
            
            cursor.execute(query, values)
            db.commit()
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Recurring transaction not found")
            
            cursor.close()
            logger.info(f"Recurring transaction updated: {recurring_id}")
            return JSONResponse({"status": "Updated!"}, status_code=200)
            
        except Exception as e:
            logger.error(f"Error updating recurring transaction: {str(e)}")
            return JSONResponse({"detail": str(e)}, status_code=500)

    @app.delete("/recurring/Delete/{recurring_id}")
    async def delete_recurring_transaction(recurring_id: int, user=Depends(verify_token), db=Depends(get_db)):
        """Delete a recurring transaction."""
        logger.info(f"DeleteRecurringTransaction called for user: {user['uid']}, id: {recurring_id}")
        cursor = db.cursor()
        try:
            cursor.execute("DELETE FROM recurring_transactions WHERE uid=%s AND id=%s", (user["uid"], recurring_id))
            db.commit()
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Recurring transaction not found")
            
            cursor.close()
            logger.info(f"Recurring transaction deleted: {recurring_id}")
            return JSONResponse({"status": "Deleted!"}, status_code=200)
            
        except Exception as e:
            logger.error(f"Error deleting recurring transaction: {str(e)}")
            return JSONResponse({"detail": str(e)}, status_code=500)

    @app.post("/recurring/Process")
    async def process_recurring_transactions(user=Depends(verify_token), db=Depends(get_db)):
        """Manually trigger processing of due recurring transactions."""
        logger.info(f"Manual recurring transaction processing for user: {user['uid']}")
        cursor = db.cursor(dictionary=True)
        try:
            result = await process_due_recurring(user["uid"], cursor, db)
            return JSONResponse({"status": "Processed", **result}, status_code=200)
        except Exception as e:
            logger.error(f"Error processing recurring: {str(e)}")
            return JSONResponse({"detail": str(e)}, status_code=500)

    @app.get("/recurring/Upcoming")
    async def get_upcoming_recurring(user=Depends(verify_token), db=Depends(get_db)):
        """Get upcoming recurring transactions for the next 30 days."""
        cursor = db.cursor(dictionary=True)
        try:
            # Get active recurring transactions
            cursor.execute("""
                SELECT id, amount, type, category, frequency, start_date, end_date, 
                       description, next_due_date
                FROM recurring_transactions 
                WHERE uid=%s AND is_active=1
            """, (user["uid"],))
            recurring = cursor.fetchall()
            cursor.close()
            
            today = date.today()
            next_30_days = today + timedelta(days=30)
            
            upcoming = []
            for r in recurring:
                due_date = r["next_due_date"]
                if due_date and due_date <= next_30_days:
                    # Calculate all occurrences in the next 30 days
                    occurrences = calculate_occurrences(r, today, next_30_days)
                    for occ_date in occurrences:
                        upcoming.append({
                            "recurring_id": r["id"],
                            "amount": r["amount"],
                            "type": r["type"],
                            "category": r["category"],
                            "frequency": r["frequency"],
                            "description": r["description"],
                            "due_date": occ_date.isoformat(),
                        })
            
            # Sort by due date
            upcoming.sort(key=lambda x: x["due_date"])
            return JSONResponse(content=jsonable_encoder(upcoming), status_code=200)
            
        except Exception as e:
            logger.error(f"Error getting upcoming recurring: {str(e)}")
            return JSONResponse({"detail": str(e)}, status_code=500)


async def process_due_recurring(uid: str, cursor, db):
    """Process all due recurring transactions for a user."""
    today = date.today()
    
    # Get active recurring transactions that are due
    cursor.execute("""
        SELECT id, amount, type, category, frequency, start_date, end_date, 
               description, next_due_date
        FROM recurring_transactions 
        WHERE uid=%s AND is_active=1 AND next_due_date <= %s
    """, (uid, today))
    
    due_transactions = cursor.fetchall()
    processed = 0
    skipped = 0
    errors = []
    
    for rt in due_transactions:
        try:
            # Check if end_date has passed
            if rt["end_date"] and rt["end_date"] < today:
                cursor.execute("UPDATE recurring_transactions SET is_active=0 WHERE id=%s", (rt["id"],))
                skipped += 1
                continue
            
            # Check if already processed for this due date (prevent duplicates)
            cursor.execute("""
                SELECT id FROM transactions 
                WHERE uid=%s AND amount=%s AND type=%s AND category=%s AND date=%s
                AND description LIKE %s
            """, (uid, rt["amount"], rt["type"], rt["category"], rt["next_due_date"], f"%recurring:{rt['id']}%"))
            
            existing = cursor.fetchone()
            if existing:
                skipped += 1
                # Still update next_due_date
                next_due = calculate_next_due_date(rt["next_due_date"], rt["frequency"])
                cursor.execute("UPDATE recurring_transactions SET next_due_date=%s WHERE id=%s", (next_due, rt["id"]))
                continue
            
            # Create the transaction
            description = rt["description"]
            if description:
                description += f" (recurring:{rt['id']})"
            else:
                description = f"recurring:{rt['id']}"
            
            cursor.execute("""
                INSERT INTO transactions (uid, amount, type, category, date, description)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (uid, rt["amount"], rt["type"], rt["category"], rt["next_due_date"], description))
            
            # Calculate next due date
            next_due = calculate_next_due_date(rt["next_due_date"], rt["frequency"])
            
            # Check if next due date exceeds end_date
            if rt["end_date"] and next_due > rt["end_date"]:
                cursor.execute("UPDATE recurring_transactions SET is_active=0, next_due_date=%s WHERE id=%s", (next_due, rt["id"]))
            else:
                cursor.execute("UPDATE recurring_transactions SET next_due_date=%s WHERE id=%s", (next_due, rt["id"]))
            
            processed += 1
            
        except Exception as e:
            logger.error(f"Error processing recurring transaction {rt['id']}: {str(e)}")
            errors.append({"id": rt["id"], "error": str(e)})
    
    db.commit()
    return {
        "processed": processed,
        "skipped": skipped,
        "errors": errors,
        "total_due": len(due_transactions)
    }


def calculate_next_due_date(current_date: date, frequency: str) -> date:
    """Calculate the next due date based on frequency."""
    if frequency == "daily":
        return current_date + timedelta(days=1)
    elif frequency == "weekly":
        return current_date + timedelta(weeks=1)
    elif frequency == "monthly":
        # Handle month-end correctly
        if current_date.month == 12:
            next_month = current_date.replace(year=current_date.year + 1, month=1)
        else:
            next_month = current_date.replace(month=current_date.month + 1)
        # Handle day overflow (e.g., Jan 31 -> Feb 28/29)
        try:
            return next_month
        except ValueError:
            # Day doesn't exist in next month, use last day
            last_day = calendar.monthrange(next_month.year, next_month.month)[1]
            return next_month.replace(day=min(current_date.day, last_day))
    elif frequency == "yearly":
        try:
            return current_date.replace(year=current_date.year + 1)
        except ValueError:
            # Feb 29 on non-leap year
            return current_date.replace(year=current_date.year + 1, day=28)
    else:
        return current_date + timedelta(days=30)  # fallback


def calculate_occurrences(recurring: dict, start_date: date, end_date: date) -> List[date]:
    """Calculate all occurrence dates within a range."""
    occurrences = []
    current = recurring["next_due_date"]
    frequency = recurring["frequency"]
    end_limit = recurring["end_date"] or end_date
    
    while current <= end_date and current <= end_limit:
        if current >= start_date:
            occurrences.append(current)
        current = calculate_next_due_date(current, frequency)
    
    return occurrences


# ── Subscription Detection ──────────────────────────────────────────────────

def detect_subscriptions(uid: str, cursor, lookback_months: int = 6, min_occurrences: int = 3) -> List[dict]:
    """
    Detect potential subscriptions from transaction history.
    Uses heuristic: same merchant/category + similar amount + regular interval.
    """
    from collections import defaultdict
    import statistics
    
    # Get expense transactions from lookback period
    cutoff_date = date.today() - timedelta(days=lookback_months * 30)
    
    cursor.execute("""
        SELECT category, amount, date, description
        FROM transactions 
        WHERE uid=%s AND type='Expense' AND date >= %s
        ORDER BY date ASC
    """, (uid, cutoff_date))
    
    transactions = cursor.fetchall()
    if not transactions:
        return []
    
    # Group by category + amount (rounded to nearest 10)
    groups = defaultdict(list)
    for t in transactions:
        amount_bucket = round(t["amount"] / 10) * 10
        key = (t["category"], amount_bucket)
        groups[key].append(t)
    
    subscriptions = []
    for (category, amount), txns in groups.items():
        if len(txns) < min_occurrences:
            continue
        
        # Check interval regularity
        dates = [t["date"] for t in txns]
        dates.sort()
        
        intervals = []
        for i in range(1, len(dates)):
            delta = (dates[i] - dates[i-1]).days
            intervals.append(delta)
        
        if not intervals:
            continue
        
        # Calculate interval statistics
        median_interval = statistics.median(intervals)
        interval_std = statistics.stdev(intervals) if len(intervals) > 1 else 0
        
        # Determine frequency
        frequency = "unknown"
        if 25 <= median_interval <= 35:
            frequency = "monthly"
        elif 6 <= median_interval <= 8:
            frequency = "weekly"
        elif 85 <= median_interval <= 95:
            frequency = "quarterly"
        elif 360 <= median_interval <= 370:
            frequency = "yearly"
        
        # Confidence score based on regularity
        confidence = 0.0
        if interval_std <= 5:  # Very regular
            confidence = 0.9
        elif interval_std <= 10:
            confidence = 0.7
        elif interval_std <= 15:
            confidence = 0.5
        else:
            confidence = 0.3
        
        # Boost confidence for known subscription categories
        subscription_categories = ["netflix", "spotify", "github", "aws", "digitalocean", 
                                  "vercel", "cloudflare", "domain", "hosting", "vpn",
                                  "gym", "insurance", "phone", "internet", "electricity"]
        
        if any(cat in category.lower() for cat in subscription_categories):
            confidence = min(1.0, confidence + 0.2)
        
        if confidence >= 0.5:
            subscriptions.append({
                "category": category,
                "amount": amount,
                "frequency": frequency,
                "confidence": round(confidence, 2),
                "occurrences": len(txns),
                "last_date": max(dates).isoformat(),
                "median_interval_days": median_interval,
                "suggested_start_date": min(dates).isoformat(),
            })
    
    return subscriptions


@app.post("/recurring/DetectSubscriptions")
async def detect_user_subscriptions(user=Depends(verify_token), db=Depends(get_db)):
    """Detect potential subscriptions from transaction history."""
    logger.info(f"Subscription detection for user: {user['uid']}")
    cursor = db.cursor(dictionary=True)
    try:
        subscriptions = detect_subscriptions(user["uid"], cursor)
        cursor.close()
        return JSONResponse(content=jsonable_encoder(subscriptions), status_code=200)
    except Exception as e:
        logger.error(f"Error detecting subscriptions: {str(e)}")
        return JSONResponse({"detail": str(e)}, status_code=500)


@app.post("/recurring/CreateFromSubscription")
async def create_recurring_from_subscription(
    request: Request,
    user=Depends(verify_token),
    db=Depends(get_db)
):
    """Create a recurring transaction from a detected subscription."""
    logger.info(f"Create recurring from subscription for user: {user['uid']}")
    cursor = db.cursor(dictionary=True)
    try:
        data = await request.json()
        required = ["category", "amount", "frequency", "start_date"]
        if not all(k in data for k in required):
            raise HTTPException(status_code=422, detail="Missing required fields")
        
        # Use the same logic as add_recurring_transaction
        amount = data["amount"]
        transaction_type = data.get("type", "Expense")
        category = data["category"]
        frequency = data["frequency"]
        start_date = data["start_date"]
        end_date = data.get("end_date")
        description = data.get("description", "Auto-detected subscription")
        
        cursor.execute("""
            INSERT INTO recurring_transactions 
            (uid, amount, type, category, frequency, start_date, end_date, description, is_active, next_due_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user["uid"], amount, transaction_type, category, frequency, start_date, end_date, description, True, start_date))
        
        db.commit()
        recurring_id = cursor.lastrowid
        cursor.close()
        
        return JSONResponse({"status": "Created!", "id": recurring_id}, status_code=200)
        
    except Exception as e:
        logger.error(f"Error creating recurring from subscription: {str(e)}")
        return JSONResponse({"detail": str(e)}, status_code=500)
