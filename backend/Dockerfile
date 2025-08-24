FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app .
RUN mkdir -p /app/logs

EXPOSE 8000

CMD ["uvicorn", "xpensex:app", "--host", "0.0.0.0", "--port", "8000"]