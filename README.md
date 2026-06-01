# 🏆 Skyline

Tournaments Management System

---

## Prerequisites

Ensure you have the following tools installed on your system:

*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

---

## How to Start

Follow these steps to set up the project environment:

### 1. Open folder where project was cloned in terminal

Please, note that:
- all commands should be run in the same terminal window one-by-one
- all commands should be run from the root folder of the project where `.env.example` file is located.

### 2. Prepare configuration
Initialize your environment variables by copying the example file:
```bash
cp .env.example .env
```

### 3. Configuration
Open the newly created `.env` file and set a secure password for the `POSTGRES_PASSWORD` variable.

### 4. Deployment
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

You can find description of test data created during seed process in `/seed_log/users.txt` file.

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