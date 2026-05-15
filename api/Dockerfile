FROM python:3.12-slim

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT [ "/app/entrypoint.sh" ]

CMD [ "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" ]