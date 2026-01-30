# 🏙️ PROACCURA

> A next-generation Property Management System streamlining operations for Landlords and Tenants.

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=statuspage)
![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**PROACCURA** is a comprehensive solution designed to bridge the gap between landlords and tenants. It replaces outdated, manual property management methods with a sleek, digital interface. From financial tracking and lease management to maintenance requests and community engagement, PROACCURA handles it all in one secure platform.

---

## 🚀 Features

### For Landlords 🏢
*   **📊 Dynamic Dashboard**: Real-time insights into occupancy rates, financial health, and maintenance status.
*   **🏘️ Property Hub**: Centralized management for all property listings and details.
*   **👥 Tenant Oversight**: Seamless onboarding, lease tracking, and permission management.
*   **💰 Financial Suite**: Automated rent tracking, expense logging, and detailed financial reports.
*   **🛠️ Maintenance Control**: Efficient ticketing system to track and resolve property issues.
*   **📂 Document Vault**: Secure storage for leases, contracts, and legal notices.

### For Tenants 🏠
*   **🖥️ Personal Portal**: A dedicated dashboard for lease info, payments, and alerts.
*   **🔧 Issue Reporting**: Easy-to-use maintenance request system with image uploads.
*   **💬 Community Board**: A space to connect with neighbors and building management.
*   **💳 Payments**: Transparent payment history and upcoming due date tracking.
*   **📄 Digital Papers**: Instant access to shared documents and agreements.

### Core Capabilities 🔐
*   **🛡️ Role-Based Security**: Robust authentication for Admins, Landlords, and Tenants via JWT.
*   **💬 Real-time Messaging**: Built-in chat for direct and instant communication.
*   **🌍 Multi-Language**: Accessible interface supporting multiple languages (e.g., English, Marathi).
*   **📱 Fully Responsive**: Optimized experience across Desktop, Tablet, and Mobile.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction), [Node.js](https://nodejs.org/) |
| **Database** | [MongoDB](https://www.mongodb.com/) (Mongoose ODM) |
| **Auth** | Custom JWT (jose), Bcryptjs |
| **Visualization** | [Recharts](https://recharts.org/) |
| **Utilities** | `date-fns`, `uuid`, `pdfkit` |

---

## 📂 Project Structure

```bash
tenant-landlord/
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   │   ├── api/            # Backend API Endpoints
│   │   ├── landlord/       # Landlord Module
│   │   ├── tenant/         # Tenant Module
│   │   └── ...
│   ├── components/         # Reusable UI Components
│   ├── lib/                # Database & Utility Functions
│   ├── models/             # Mongoose Data Models
│   └── ...
├── public/                 # Static Assets (Images, Icons)
└── package.json            # Dependencies & Scripts
```

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   **Node.js**: v18 or higher
*   **Package Manager**: npm or yarn
*   **Database**: MongoDB Connection String (Atlas or Local)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Nadeem-Shaikh12/PROACCURA.git
    cd tenant-landlord
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_jwt_secret
    NEXT_PUBLIC_API_URL=http://localhost:3000
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with hot-reload. |
| `npm run build` | Compiles the application for production. |
| `npm run start` | Runs the built production application. |
| `npm run lint` | Checks for code quality and style issues. |

---

## ☁️ Deployment

The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNadeem-Shaikh12%2FPROACCURA)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ by <strong>Nadeem Shaikh</strong>
</p>