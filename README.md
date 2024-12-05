# Final Project Module Web 2.5

Welcome to the Final Project Module  for Web2.5. This repository contains all necessary instructions to set up and launch the project, as well as additional resources to help you understand the theoretical foundations.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Installation](#installation)
4. [Running the Project](#running-the-project)
5. [Contributions](#contributions)]
7. [License](#license)

# **Ethereum Private Network Automator**

## **Project Overview**
Ethereum Private Network Automator is a development web app designed to simplify the creation of Ethereum private networks. This tool allows developers to quickly set up and manage Ethereum private networks based on the Clique consensus, streamlining blockchain development.

⚠️ **This is a development version.** Users must manually set up and run the app by following the instructions below.

---

## **Features**
- Automates the creation and management of Ethereum private networks.
- Includes a faucet which allows to obtain funds easily to start making transactions
- Includes a block explorer to view the blockchain data in real-time 
- **Frontend:** Built with React and TypeScript for a modern, responsive UI.
- **Backend:** Uses Node.js and TypeScript to handle Ethereum network creation and management.
- Uses ethers.js and Web3.js for blockchain interactions
- Uses Docker for containerization

---

## **Getting Started**

### **Prerequisites**
Before you begin, ensure you have the following installed:

- **Node.js** (v14.x or later)
- **npm** (v6.x or later)
- **Docker** (for running Ethereum nodes)
  - Install Docker from [here](https://www.docker.com/get-started).
  - Ensure the Docker daemon is running on your system.
- **Git** (for cloning the repository)

---

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/codecrypto-academy/pfm-web2.5-oct24-1.git
   cd pfm-web2.5-oct24-1

1. **Install Dependencies**
    
    - Install the project-level dependencies
    ```bash
    npm install
    ```
    - Install backend dependencies
    ```bash
    cd backend
    npm install
    cd..
    ```

    - Install frontend dependencies
    ```bash
    cd frontend
    npm install
    cd..
    ```

## **Running the Project**
    
1. **Start Docker Daemon**
    
    The application requires Docker to run the Ethereum network. Make sure Docker is installed and the Docker daemon is running:

    - Start Docker (depending on your system, you may need to open the Docker Desktop app or use a terminal command to start it).
    - Verify Docker is running:
    ```bash
    docker info
    ```

1. **Start the Backend**

    Navigate to the backend directory and start the backend server:
    ```bash
    cd backend
    npx nodemon src/app.ts
    ```

1. **Start the frontend**
    
    Navigate to the frontend directory and start the react app:
    ```bash
    cd frontend
    npm run dev
    ```

1. **Access the web App**
    
    Open your browser and navigate to:
    ```
    http://localhost:5173/
    ```

## **Contributions**

Contributions, issues, and feature requests are welcome. If you want to contribute:
- Fork the repository
- Create feature branch
- Commit your changes
- Push your branch and open a pull request

## **License**
    
This project is licensed under the MIT License.
