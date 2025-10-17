# authify

## 🔐 Authify – Secure Authentication API

**Authify** is a robust authentication API built with **Node.js**, **Express.js**, and **JWT** to provide secure user authentication and authorization services. It supports essential authentication features, including:

* **User Registration**: Secure sign-up with email and password.
* **Login & JWT Tokens**: Issue JSON Web Tokens for session management.
* **OTP Verification**: Implement one-time password (OTP) verification for added security.
* **Account Deletion**: Allow users to delete their accounts securely.

The API is designed to be easily integrated into web applications, offering a straightforward approach to implementing authentication mechanisms.


## ⚙️ Core Features

* **User Registration**: Register users with email and password, ensuring data validation and security.
* **Login & JWT Authentication**: Authenticate users and issue JWT tokens for secure sessions.
* **OTP Verification**: Enhance security by verifying user identity through OTPs.
* **Account Deletion**: Enable users to delete their accounts after verifying their identity.
* **RESTful API Endpoints**: Designed with REST principles for easy integration.


## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Authentication**: JWT (JSON Web Tokens)
* **Security**: bcrypt for password hashing
* **Environment Management**: dotenv for environment variables
* **API Documentation**: Swagger (optional, for API documentation)


### 🚀 Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Jahanvi-07/authify.git
   cd authify
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory and add your environment variables, such as:

   ```plaintext
   JWT_SECRET=your_jwt_secret
   OTP_SECRET=your_otp_secret
   DB_URI=your_database_uri
   ```

4. **Run the server**:

   ```bash
   npm start
   ```

   The API will be running on `http://localhost:3000`.

---




