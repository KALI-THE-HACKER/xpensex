# 📚 XpenseX - Complete Technical Documentation

<div align="center">

![XpenseX Logo](https://img.shields.io/badge/XpenseX-Personal%20Finance%20Tracker-purple?style=for-the-badge&logo=money-bill&logoColor=white)

*Comprehensive documentation for XpenseX - A full-stack personal finance management application*

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Frontend Documentation](#frontend-documentation)
- [Backend Documentation](#backend-documentation)
- [DevOps & Infrastructure](#devops--infrastructure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Deployment Guide](#deployment-guide)
- [Security Implementation](#security-implementation)
- [Performance Considerations](#performance-considerations)
- [Contributing Guidelines](#contributing-guidelines)

---

## 🎯 Overview

XpenseX is a comprehensive personal finance management web application that helps users visualize and manage their finances in one centralized dashboard. Built to address the overwhelming nature of tracking various income sources, expenses, and savings goals, this application provides an intuitive solution for financial management.

### Problem Statement
Managing personal finances can be overwhelming with various income sources, expenses, and savings goals to track. XpenseX solves this by providing a simple yet effective web application that helps users visualize and manage their finances in one place.

### Core Features
- **📊 User-Friendly Dashboard**: Input and categorize income and expenses (rent, groceries, salary, freelance work)
- **📈 Visual Data Display**: Charts and graphs for easy understanding of financial situations
- **🎯 Budget Management**: Set budget limits for categories with notifications when approaching/exceeding limits
- **💰 Savings Goals**: Set and track progress towards savings goals (e.g., saving for a laptop)
- **🔐 Secure Authentication**: Firebase-based authentication with email verification
- **📱 Responsive Design**: Mobile-first approach with desktop optimization

### Technical Implementation
- **🐳 Advanced Containerization**: Multi-stage Docker builds with optimized production images
- **🔒 Enterprise Security**: Environment-based secrets, Firebase JWT validation, Cloudflare protection
- **🏗️ Multi-Service Architecture**: Orchestrated containers with Docker Compose networking
- **☁️ Azure Cloud Deployment**: Production-ready VM infrastructure with automated provisioning
- **🔄 Automated CI/CD Pipeline**: 
  - GitHub Actions workflow triggers on every commit
  - Automated Docker image builds with multi-architecture support
  - Docker Hub registry integration with version tagging
  - Zero-downtime deployment to Azure infrastructure
- **� DevOps Monitoring**: Comprehensive logging, health checks, and performance monitoring
- **🌐 Production-Grade Networking**: Nginx reverse proxy with SSL termination and load balancing

### Technology Stack
- **Frontend**: React 19, Vite 7, TailwindCSS 4, Chart.js
- **Backend**: FastAPI, Python 3.9+, MySQL 8.0
- **Authentication**: Firebase Auth + Custom Domain Integration
- **🔄 CI/CD Pipeline**: GitHub Actions with automated Docker builds & Azure deployment
- **🐳 DevOps**: Docker multi-stage builds, Docker Compose orchestration, Nginx reverse proxy
- **☁️ Cloud Infrastructure**: Azure VM deployment with automated scaling & monitoring
- **🔒 Security**: Cloudflare SSL, environment-based secrets management

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (FastAPI)     │◄──►│    (MySQL)      │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          ▲                       ▲
          │                       │
          ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Firebase      │
│  (Reverse Proxy)│    │     Auth        │
│  Ports: 80/443  │    │                 │
└─────────────────┘    └─────────────────┘
```

### Application Flow
1. **🔐 Authentication Pipeline**: Firebase handles user registration with custom domain email delivery
2. **🔄 CI/CD Automation**: GitHub Actions automatically builds and deploys on code changes
3. **🌐 Request Routing**: Cloudflare → Nginx → Frontend/Backend services
4. **🔑 JWT Token Verification**: Backend validates Firebase ID tokens for secure API access
5. **📊 Data Processing**: FastAPI processes requests with MySQL database operations
6. **⚡ Real-time Synchronization**: Context API ensures instant UI updates across components
7. **🛡️ Security Layers**: Multi-layered security with Cloudflare DDoS protection and SSL
8. **📈 DevOps Monitoring**: Automated health checks and logging across all services

---

## 🎨 Frontend Documentation

### Project Structure
```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── Components/
│   │   ├── AddTransaction.jsx
│   │   ├── Charts.jsx
│   │   ├── Dashboard.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SetBudgetGoals.jsx
│   │   ├── SetSavingsGoals.jsx
│   │   ├── ShowBudgetGoals.jsx
│   │   ├── ShowSavingsGoals.jsx
│   │   ├── Tiles.jsx
│   │   └── Transactions.jsx
│   ├── context/
│   │   └── RefetchContext.jsx
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
├── Dockerfile
├── package.json
├── vite.config.js
└── eslint.config.js
```

### Core Components

#### 📊 Dashboard Components
- **Dashboard.jsx**: Main container component managing all data and layout
- **Tiles.jsx**: Displays financial summary (Income, Expense, Balance, Savings)
- **Charts.jsx**: Interactive visualizations using Chart.js
- **Transactions.jsx**: Recent transaction history display

#### 🎯 Goal Management
- **SetBudgetGoals.jsx**: Create and manage budget goals
- **ShowBudgetGoals.jsx**: Display budget goals with progress tracking
- **SetSavingsGoals.jsx**: Create and manage savings goals
- **ShowSavingsGoals.jsx**: Display savings goals with progress tracking

#### 🔄 State Management
- **RefetchContext.jsx**: Global context for data synchronization
- **Local State**: Component-level state management with React hooks

### Key Frontend Features

#### 🎨 Styling & UI
- **TailwindCSS 4**: Utility-first CSS framework
- **Dark Theme**: Modern gradient-based design
- **Responsive Design**: Mobile-first with desktop optimization
- **Color Scheme**: Purple/pink gradients with semantic colors

#### 🔄 Data Flow
- **API Integration**: Fetch API for backend communication
- **Token Management**: Firebase ID tokens for authentication

### Environment Configuration
```javascript
// .env.example
VITE_API_URL=/api # Backend API URL inside docker network
```

---

## 🚀 Backend Documentation

### Project Structure
```
backend/
├── app/
│   ├── db_tables_config.py
│   └── xpensex.py
├── Dockerfile
└── requirements.txt
```

### Core Backend Components

#### 🗄️ Database Configuration
- **db_tables_config.py**: Database initialization and table creation
- **Table Schemas**: Transactions, budget, and savings tables

#### 🔧 Main Application
- **xpensex.py**: FastAPI application with all endpoints
- **Authentication**: Firebase token verification
- **CORS Configuration**: Cross-origin request handling
- **Logging**: Comprehensive application logging

### API Endpoints

#### 🔐 Authentication Middleware
```python
def verify_token(auth_creds: HTTPAuthorizationCredentials = Depends(security))
```
- Validates Firebase ID tokens
- Extracts user information
- Handles authentication errors

#### 📊 Data Endpoints

##### `GET /health`
- **Purpose**: Health check endpoint
- **Response**: Service status

##### `GET /wholeData`
- **Purpose**: Retrieve all user financial data
- **Response**: Complete dashboard data including transactions, categories, goals
- **Data Returned**:
  - Expense/Income categories
  - Transaction history
  - Budget goals with progress
  - Savings goals with progress
  - Financial summaries

##### `POST /AddTransaction`
- **Purpose**: Add new financial transaction
- **Response**: Success/error status

##### `POST /SetBudget`
- **Purpose**: Create budget goal
- **Response**: Success/error status

##### `DELETE /DeleteBudget/{goalId}`
- **Purpose**: Delete budget goal
- **Parameters**: goalId (path parameter)
- **Response**: Success/error status

##### `POST /SetSavings`
- **Purpose**: Create savings goal
- **Response**: Success/error status

##### `DELETE /DeleteSavingsGoal/{goalId}`
- **Purpose**: Delete savings goal
- **Parameters**: goalId (path parameter)
- **Response**: Success/error status

### Data Processing Functions

### Environment Configuration
```python
# Environment Variables
DB_HOST=localhost
DB_PORT=3306
DB_USER=username
DB_PASSWORD=password
DB_NAME=xpensex
FIREBASE_KEY_BASE64=<base64-encoded-firebase-credentials>
```

---

## 🛠️ DevOps & Infrastructure

### 🔄 CI/CD Pipeline Architecture

#### **GitHub Actions Workflow**
```yaml
name: Deploy to Azure
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Build Docker Images (Frontend & Backend)
      - Push to Docker Hub Registry
      - Deploy to Azure VM
      - Health Check Validation
```

#### **Automated Deployment Process**
1. **Code Push Trigger**: Any commit to main branch initiates pipeline
2. **Multi-Stage Builds**: Optimized Docker images for production
3. **Registry Management**: Automated versioning and tagging in Docker Hub
4. **Azure Deployment**: Zero-downtime rolling updates on Azure VM
5. **Health Validation**: Automated testing and rollback capabilities

### 🐳 Docker Containerization Strategy

#### **Multi-Service Container Architecture**
- **Frontend Container**: React app with Nginx serving static files
- **Backend Container**: FastAPI with Uvicorn ASGI server
- **Database Container**: MySQL 8.0 with persistent volume storage
- **Reverse Proxy**: Nginx with SSL termination and load balancing

#### **Production Docker Configuration**
Multi-container setup using Docker Compose for local development and production.
Four main services orchestrated with networking and dependency management:
- **frontend**: React application with optimized production build
- **backend**: FastAPI application with health monitoring
- **mysql**: MySQL database with automated backups
- **nginx**: Nginx reverse proxy with SSL and security headers

### ☁️ Azure Cloud Infrastructure

#### **Azure VM Configuration**
- **Instance Type**: Standard B2s (2 vCPUs, 4GB RAM)
- **Operating System**: Ubuntu 22.04 LTS
- **Storage**: Premium SSD with automated backup
- **Network Security**: Firewall rules and NSG configuration
- **Monitoring**: Azure Monitor integration for performance tracking

#### **Infrastructure Components**
- **Azure Virtual Machine**: Production-grade Ubuntu server
- **Cloudflare CDN**: Global content delivery and DDoS protection
- **SSL Management**: Automated certificate provisioning and renewal
- **DNS Management**: Custom domain routing with failover capabilities
- **Load Balancing**: Nginx-based request distribution
- **Security Groups**: Restricted access with principle of least privilege

#### **Deployment Architecture**
```
GitHub → GitHub Actions → Docker Hub → Azure VM → Production
   ↓           ↓             ↓          ↓         ↓
Commit → Build Images → Push Images → Pull & Deploy → Live App
```

### 🔧 DevOps Best Practices Implementation

#### **Infrastructure as Code**
- **Docker Compose**: Service orchestration and configuration
- **Environment Management**: Separate configs for dev/staging/prod
- **Secret Management**: Azure Key Vault integration for sensitive data
- **Backup Strategy**: Automated database backups with retention policies

#### **Monitoring & Observability**
- **Application Logs**: Structured logging with rotation policies
- **Health Checks**: Automated service health monitoring
- **Performance Metrics**: Response time and resource utilization tracking
- **Error Tracking**: Comprehensive error logging and alerting

#### **Security Implementation**
- **Container Security**: Minimal base images and security scanning
- **Network Security**: Internal container networking with firewall rules
- **SSL/TLS**: End-to-end encryption with automatic certificate renewal
- **Access Control**: Role-based access with SSH key authentication

---

## 🤝 Contributing Guidelines

### Development Setup

#### 📋 Prerequisites
- Node.js 18+
- Python 3.9+
- MySQL 8.0
- Docker & Docker Compose

#### 🛠️ Local Development
```bash
# Clone repository
git clone https://github.com/KALI-THE-HACKER/xpensex.git
cd xpensex

# Start development environment
docker-compose up -d

# Frontend development
cd frontend
npm install
npm run dev

# Backend development
cd backend
pip install -r requirements.txt
uvicorn app.xpensex:app --reload
```
---

## 📞 Support & Contact

### Getting Help
- **GitHub Issues**: [Report bugs and request features](https://github.com/KALI-THE-HACKER/xpensex/issues)
- **Documentation**: This comprehensive documentation
- **Live Demo**: [https://xpensex.luckylinux.xyz](https://xpensex.luckylinux.xyz)

### Maintainer
- **GitHub**: [@KALI-THE-HACKER](https://github.com/KALI-THE-HACKER)
- **Project**: XpenseX Personal Finance Tracker

---

<div align="center">

**Built with ❤️ using modern web technologies**

![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?style=flat-square&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=flat-square&logo=docker)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?style=flat-square&logo=mysql)

</div>
