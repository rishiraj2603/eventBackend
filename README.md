# Event Management Platform

A full-stack event management application that allows users to create, manage, and participate in events. The platform provides real-time updates and a seamless user experience across all devices.

## 🌟 Features

### Core Features

- **User Authentication**

  - Secure JWT-based authentication
  - Guest login option for limited access
  - Protected routes for authenticated users

- **Event Management**

  - Create and Delete events
  - View upcoming and past events
  - Real-time attendee tracking
  - Event details including title, description, location, start date, and end date

- **Real-time Updates**

  - Live attendee count updates
  - WebSocket integration for instant notifications
  - Real-time event modifications

- **User Experience**
  - Clean and intuitive navigation

## 🛠️ Technology Stack

### Frontend

- React.js
- React Router for navigation
- Socket.IO Client for real-time features
- Modern UI components
- Responsive CSS design

### Backend

- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- Socket.IO for real-time communication
- RESTful API architecture

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/rishiraj2603/event_management.git
```

2. Install Frontend Dependencies

```bash
cd client
npm install
```

3. Install Backend Dependencies

```bash
cd server
npm install
```

4. Set up environment variables
   Create `.env` files in both client and server directories with necessary configurations.

### Frontend (.env)

```
REACT_APP_API_URL=your_backend_url
```

### Backend (.env)

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

### Running Locally

1. Start the backend server

```bash
cd server
npm run dev
```

2. Start the frontend application

```bash
cd client
npm start
```
