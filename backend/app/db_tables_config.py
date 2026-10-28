import time
import mysql.connector
from mysql.connector import Error
import os


def create_tables():
    while True:
        try:
            conn = mysql.connector.connect(
                host=os.getenv("DB_HOST"),
                port=os.getenv("DB_PORT"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                database=os.getenv("DB_NAME")
            )
            break
        except Error:
            print("Waiting for MySQL...")
            time.sleep(2)

    cursor = conn.cursor()

    # Create transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(1024) NOT NULL,
        amount INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        description VARCHAR(100)
    )
    """)

    # Create budget table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budget (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(1024) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount INT NOT NULL,
        description VARCHAR(100)
    )
    """)

    # Create savings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS savings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(1024) NOT NULL,
        name VARCHAR(50) NOT NULL,
        amount INT NOT NULL,
        description VARCHAR(100)
    )
    """)

    # Create recurring_transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recurring_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(1024) NOT NULL,
        amount INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        frequency VARCHAR(20) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        description VARCHAR(200),
        is_active BOOLEAN DEFAULT TRUE,
        next_due_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()
