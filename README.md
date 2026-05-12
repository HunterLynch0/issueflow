# IssueFlow

A full stack issue tracker full full backend developed by me and a React frontend made using ai to support the backend.

The app lets users create repositories, manage issues, assign users, and collaborate a bit like a lightweight GitHub style tracker.

This project build focused on learning to implement:

* JWT authentication
* Spring Security
* PostgreSQL
* REST APIs
* React frontend integration
* User/repository permissions

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Security
* JWT Authentication
* PostgreSQL
* Maven
* JPA / Hibernate

### Frontend

* React
* Vite
* JavaScript
* CSS

## Features

* User registration and login
* JWT-based authentication
* Create repositories
* Create and manage issues
* Assign users to repositories
* Repository access control
* Protected API endpoints
* Persistent PostgreSQL database

## Running Locally

### Backend

From the backend directory:

```bash
mvn spring-boot:run
```

You will need PostgreSQL running locally and an `application.properties` file configured with your database details.

### Frontend

From the frontend directory:

```bash
npm install
npm run dev
```

## Notes

- Half way through the deployment process I realised I was going to have to pay for the web service to support the email verfication so I decided to keep it local as the email verification is a core feature of the app.

## License

MIT
