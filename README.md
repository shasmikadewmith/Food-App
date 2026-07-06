# 🍔 WMT Food Delivery App

A full-stack Food Delivery Mobile Application built using **React Native**, **Express.js**, and **MongoDB**. The application allows customers to browse and order food, while administrators can manage food items. It also includes a delivery option for completed orders.

---

## 🚀 Features

### 👨‍🍳 Customer
- User Registration & Login
- Browse Food Menu
- Search Food Items
- Add Items to Cart
- Place Orders
- Select Delivery Option
- View Order History

### 👨‍💼 Admin
- Secure Admin Login
- Add New Food Items
- Update Food Details
- Delete Food Items
- Manage Customer Orders

### 🚚 Delivery
- Delivery option during checkout
- Order status tracking
- Manage delivery details

---

## 🛠️ Tech Stack

### Frontend
- React Native
- Expo
- Axios

### Backend
- Express.js
- Node.js

### Database
- MongoDB
- Mongoose

---

# 📂 Project Structure

```
WMT-Food-App/
│
├── frontend/          # React Native Mobile App
│
├── backend/           # Express.js API
│
└── README.md
```

---

# 📥 Getting Started

## 1. Download the Project

Clone the repository

```bash
git clone https://github.com/your-username/WMT-Food-App.git
```

Or

- Click **Code**
- Select **Download ZIP**
- Extract the ZIP file.

---

# 📦 Install Dependencies

## Frontend

Navigate to the frontend folder

```bash
cd frontend
```

Install packages

```bash
npm install
```

Start the application

```bash
npm start
```

or

```bash
npx expo start
```

---

## Backend

Open another terminal

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Start the server

```bash
npm start
```

If your project uses Nodemon

```bash
npm run dev
```

---

# 🍃 MongoDB Setup

## Step 1

Create a free MongoDB Atlas account

https://www.mongodb.com/cloud/atlas

---

## Step 2

Create a Cluster.

---

## Step 3

Create a Database User.

---

## Step 4

Allow Network Access.

For development you can allow

```
0.0.0.0/0
```

---

## Step 5

Copy your MongoDB Connection String.

Example

```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/wmt_food_app
```

---

## Step 6

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Example

```env
PORT=5000

MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/wmt_food_app

JWT_SECRET=mysecretkey123
```

---

## Step 7

Ensure your backend connects using Mongoose.

```javascript
mongoose.connect(process.env.MONGODB_URI)
```

---

# ▶ Running the Application

### Terminal 1

```bash
cd backend
npm start
```

### Terminal 2

```bash
cd frontend
npm start
```

The backend server and React Native application should now be running successfully.

---

# 🤝 Contributing

We welcome contributions to improve this project.

## Steps to Contribute

### 1. Fork the Repository

Click the **Fork** button at the top of this repository.

---

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/WMT-Food-App.git
```

---

### 3. Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

---

### 4. Make Your Changes

Implement your feature or fix the issue.

---

### 5. Commit Your Changes

```bash
git add .

git commit -m "Add new feature"
```

---

### 6. Push to Your Branch

```bash
git push origin feature/your-feature-name
```

---

### 7. Open a Pull Request

Create a Pull Request and describe the changes you made.

---

# 📄 License

This project is intended for educational purposes.

---

## ⭐ Support

If you found this project helpful, please consider giving it a **⭐ Star** on GitHub.
