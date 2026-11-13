# CS-351 Project 2

This repository our group repository for Project 2 of CS-351. Each group member is added as a collaborator to this repository.

## Group Members

Nathan Panopio, Joanna van Schie, Lauren Sediles

## Project Overview

* **frontend**: This is a React/Vite frontend application that communicates with the Express API. It builds to static files in `frontend/dist/`, which can be deployed to Google Cloud static hosting independently of the backend. See [frontend/README.md](frontend/README.md) for deployment steps.
* **backend**: This is an Express API that manages user accounts and connects to the MongoDB database. The controllers folder contains a set of controllers for managing each collection of the database and validating, storing, updating, and queryig data.

## Build Instructions

First, build the backend by setting up the .env file. You will need database connections specified with the following fields:

```env
MONGODB_URI=<MongoDB connection URL>
PORT=5000
```

Then, install the dependencies by running:

```bash
npm install
npm run start
```

The backend server should now be running. Next, start the frontend server by navigating to the frontend directory and setting up the .env file:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Save that file, and run the following commands to start the frontend server:
```bash
npm install
npm run dev
```

## Deployment Instructions

TBD