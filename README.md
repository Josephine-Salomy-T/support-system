# TicketDesk - AI-Powered Smart Support System

[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT-orange?style=flat&logo=openai)](https://openai.com/)

## Description
TicketDesk is a full-stack, role-based support ticket management system designed for modern teams. Employees submit tickets, agents resolve them with AI-assisted replies, and admins oversee analytics. Built with React, Node.js, MongoDB, and OpenAI integration for intelligent support workflows.

## Features

- **Role-Based Portals**: Employee, Agent, and Admin dashboards
- **Ticket Lifecycle**: Create, assign, update status/priority, timelines, comments
- **AI Reply Suggestions**: OpenAI-powered auto-generated responses for agents
- **Real-Time Notifications**: Socket.io for instant updates
- **Analytics Dashboards**: Charts for ticket metrics (Chart.js)
- **Secure Auth**: JWT-based authentication with protected routes
- **Rich Comments**: Threaded discussions on tickets

## Tech Stack
| Frontend | Backend | Database | Other |
|----------|---------|----------|--------|
| React 19 | Node.js/Express | MongoDB (Mongoose) | OpenAI, Socket.io |
| TypeScript | TypeScript | | Chart.js, Axios |
| Vite | ts-node/nodemon | | JWT, bcrypt |

##  Quick Start

### Prerequisites
- Node.js 20+
- MongoDB
- OpenAI API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd supportSystem
   ```

2. **Backend Setup**
   ```bash
   cd support-system-backend
   npm install
   ```
   - Create `.env` file with:
     ```
     MONGODB_URI=your_mongodb_uri
     OPENAI_API_KEY=your_openai_key
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```
   - Run: `npm run dev`

3. **Frontend Setup**
   ```bash
   cd ../smart-support-desk
   npm install
   npm run dev
   ```

4. **Access the app**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## Screenshots

### Authentication
<div align="center">
  <img src="./Screenshots/LoginScreen.png" alt="Login Page" width="600" />
  <p><strong>Login Screen</strong> - Secure JWT-based authentication</p>
</div>

---

### Employee Portal
<div align="center">
  <table>
    <tr>
      <td><img src="./Screenshots/EmployeePortal.png" alt="Employee Portal" width="400" /></td>
      <td><img src="./Screenshots/EmployeePortal-ViewTicket.png" alt="View Ticket" width="400" /></td>
    </tr>
    <tr>
      <td align="center"><strong>Dashboard</strong></td>
      <td align="center"><strong>Ticket Details</strong></td>
    </tr>
  </table>
</div>

---

### Agent Dashboard
<div align="center">
  <img src="./Screenshots/AgentDashboard.png" alt="Agent Dashboard" width="600" />
  <p><strong>Agent Dashboard</strong> - Manage and resolve support tickets</p>
</div>

<div align="center">
  <table>
    <tr>
      <td><img src="./Screenshots/Ticket-ConversationTab.png" alt="AI Reply Suggestions" width="400" /></td>
      <td><img src="./Screenshots/TicketDetailsTab.png" alt="Ticket Details Tab" width="400" /></td>
    </tr>
    <tr>
      <td align="center"><strong>AI-Powered Reply Suggestions</strong></td>
      <td align="center"><strong>Ticket Analysis</strong></td>
    </tr>
  </table>
</div>

---

### Admin Dashboard
<div align="center">
  <table>
    <tr>
      <td><img src="./Screenshots/AdminDahboard1.png" alt="Admin Analytics Overview" width="400" /></td>
      <td><img src="./Screenshots/AdminDashboard2.png" alt="Admin Analytics Detailed" width="400" /></td>
    </tr>
    <tr>
      <td align="center"><strong>Analytics Overview</strong></td>
      <td align="center"><strong>Detailed Metrics</strong></td>
    </tr>
  </table>
</div>

<div align="center">
  <img src="./Screenshots/DeleteTicket.png" alt="Delete Ticket" width="600" />
  <p><strong>Delete Ticket</strong> - Remove tickets from the system</p>
</div>

---

### Notifications & Support
<div align="center">
  <table>
    <tr>
      <td><img src="./Screenshots/NotificationList.png" alt="Notifications" width="400" /></td>
      <td><img src="./Screenshots/AdminTicketList.png" alt="Admin Ticket Management" width="400" /></td>
    </tr>
    <tr>
      <td align="center"><strong>Real-Time Notifications</strong></td>
      <td align="center"><strong>Ticket Management</strong></td>
    </tr>
  </table>
</div>
