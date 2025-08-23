# 💰 XpenseX - Personal Finance Tracker

<div align="center">

![XpenseX Logo](https://img.shields.io/badge/XpenseX-Personal%20Finance%20Tracker-purple?style=for-the-badge&logo=money-bill&logoColor=white)

![Version](https://img.shields.io/badge/Version-v1.0.0--beta-orange?style=for-the-badge)

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)
![React](https://img.shields.io/badge/React-v19-61DAFB.svg?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-v7-646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?style=flat-square&logo=fastapi&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=flat-square&logo=docker&logoColor=white)

*A comprehensive, modern financial management application built with cutting-edge technologies*

[🚀 Live Demo](https://xpensex.luckylinux.xyz) • [📖 Documentation](#installation) • [🐛 Report Bug](https://github.com/KALI-THE-HACKER/xpensex/issues)

</div>

---

## ✨ Overview

XpenseX is a full-featured personal finance management application designed to help users take control of their financial life. Built with modern technologies and containerized for easy deployment, it offers comprehensive expense tracking, budget management, and financial insights through beautiful visualizations.

<!-- After Stable release
## 📱 Screenshots
<div align="center">
  
| Dashboard Overview | Transaction Management |
|:--:|:--:|
| ![Dashboard](./screenshots/dashboard.png) | ![Transactions](./screenshots/transactions.png) |

| Budget Goals | Savings Tracker |
|:--:|:--:|
| ![Budget Goals](./screenshots/budget-goals.png) | ![Savings Goals](./screenshots/savings-goals.png) |

</div>

-->

## 🚀 Features

### 💳 **Transaction Management**
- ✅ **Multi-category tracking** - Expense, Income, and Savings transactions
- ✅ **Smart categorization** - Automatic category suggestions and custom categories
- ✅ **Real-time updates** - Instant synchronization across all components
- ✅ **Detailed descriptions** - Add notes and context to transactions

### 📊 **Visual Analytics**
- ✅ **Interactive charts** - Beautiful Chart.js visualizations
- ✅ **Monthly breakdowns** - Current month vs historical data
- ✅ **Category-wise analysis** - Pie charts and bar graphs
- ✅ **Income vs Expense trends** - Multi-period comparison
- ✅ **Real-time dashboard tiles** - Balance, savings, income, and expense summaries

### 🎯 **Goal Management**
- ✅ **Budget goals** - Set monthly spending limits per category
- ✅ **Savings goals** - Track progress toward financial objectives
- ✅ **Progress tracking** - Visual progress bars with color-coded alerts
<!-- Under Development
- ✅ **Goal notifications** - Smart alerts when approaching limits
- ✅ **CRUD operations** - Create, read, update, and delete goals
-->

### 🔐 **Security & Authentication**
- ✅ **Firebase Authentication** - Secure email/password login
- ✅ **Email verification** - Required email confirmation for new accounts
- ✅ **Password reset** - Secure password recovery via email
- ✅ **JWT token validation** - Server-side authentication verification

### 🎨 **User Experience**
- ✅ **Fully responsive design** - Mobile-first approach with desktop optimization
- ✅ **Dark theme UI** - Modern gradient-based design

### ⚙️ **Technical Features**
- ✅ **RESTful API** - Well-structured backend with comprehensive endpoints
- ✅ **Database persistence** - MySQL with optimized queries
- ✅ **Containerized deployment** - Docker and Docker Compose support
- ✅ **Reverse proxy** - Nginx for production deployment
- ✅ **Comprehensive logging** - Detailed application and error logging

## 🛠️ Tech Stack

### **Frontend**
- **⚛️ React 19** - Latest React with concurrent features
- **⚡ Vite 7** - Lightning-fast build tool and dev server
- **🎨 TailwindCSS 4** - Utility-first CSS framework
- **📊 Chart.js** - Beautiful, responsive charts
- **🔥 Firebase SDK** - Authentication and real-time features

### **Backend**
- **🚀 FastAPI** - Modern, fast Python web framework
- **🗄️ MySQL** - Reliable relational database
- **📝 Comprehensive logging** - Application monitoring and debugging
- **🛡️ JWT Authentication** - Secure token-based auth
- **⚡ Uvicorn** - High-performance ASGI server

### **DevOps & Deployment**
- **🐳 Docker** - Containerized application
- **🔄 Docker Compose** - Multi-container orchestration
- **⚙️ CI/CD Piplelines** - CI/CD Pipelines for easy deployment
- **🌐 Nginx** - Reverse proxy and static file serving
- **☁️ Azure** - Cloud deployment platform

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **Docker & Docker Compose** (for containerized deployment)
- **MySQL** (8.0 or higher)

### 🚀 Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/KALI-THE-HACKER/xpensex.git
cd xpensex

# Create environment file
cp .env .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Application will be available at http://localhost
```

### 🔧 Manual Installation

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env .env
# Configure your database and Firebase credentials

# Start the FastAPI server
uvicorn xpensex:app --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies  
npm install

# Set up environment variables
cp .env .env
# Configure your API endpoint

# Start the development server
npm run dev
```

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=xpensex
DB_ROOT_PASSWORD=your_root_password

# Firebase Configuration
FIREBASE_CREDENTIALS_JSON=<Firebase-service-account-token>
```

#### Frontend (.env)
```bash
# API Configuration
VITE_SERVER_URL=http://localhost:8000
```

## 🚀 Deployment

### Docker Deployment
```bash
# Production build and deployment
docker-compose -f docker-compose.yml up -d --build

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=2
```

### Manual Deployment
```bash
# Frontend production build
cd frontend && npm run build

# Backend production setup
cd backend && pip install gunicorn
gunicorn app.xpensex:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

Please ensure your code follows our coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Lucky Verma**
- GitHub: [@KALI-THE-HACKER](https://github.com/KALI-THE-HACKER)
- Website: [luckylinux.xyz](https://luckylinux.xyz)

## 🙏 Acknowledgments

- **Firebase** for authentication services
- **Chart.js** for beautiful data visualizations  
- **TailwindCSS** for the amazing utility-first CSS framework
- **FastAPI** for the incredible Python web framework
- **React team** for the robust frontend library

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Lucky Verma](https://github.com/KALI-THE-HACKER)

</div>
