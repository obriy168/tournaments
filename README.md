# 🏆 Slyline

Tournaments Management System

---

## Prerequisites

Ensure you have the following tools installed on your system:

*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

---

## How to Start

Follow these steps to set up the project environment:

### 1. Prepare configuration
Initialize your environment variables by copying the example file:
```bash
cp .env.example .env
```

### 2. Configuration
Open the newly created `.env` file and set a secure password for the `POSTGRES_PASSWORD` variable.

### 3. Deployment
Build and launch the application services:
```bash
docker compose up --build
```

---

## Usage

Once the deployment is successful, the services will be available at:

| Service | URL |
| :--- | :--- |
| **Frontend** | [http://localhost:8080/](http://localhost:8080/) |
| **API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## Management

### Stop Services
To stop and remove the containers:
```bash
docker compose down
```

### Full Reset
To stop services and **wipe the database volumes** (this will delete all data):
```bash
docker compose down -v
```