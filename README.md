\# Apartment Management System



\*\*Group 6 — Spring Boot + React\*\*



A full-stack web application for managing rental properties: owners, apartments, units, tenants, leases, payments, and maintenance requests, with a live statistics dashboard.



\---



\## 1. Project Overview



The Apartment Management System replaces manual, paper- and spreadsheet-based rental tracking with a single centralized platform. It is built as two applications:



\- \*\*Backend\*\* — Spring Boot 4 (Java 21) REST API, PostgreSQL database, JWT-secured.

\- \*\*Frontend\*\* — React 18 (Vite) single-page application, communicating with the backend via Axios.



\### Key Features

\- Owner, apartment, unit, tenant, lease, payment, and maintenance-request management (full CRUD)

\- JWT-based authentication with ADMIN / EMPLOYEE roles

\- Automatic unit status updates (OCCUPIED / AVAILABLE) driven by lease activity

\- Scheduled job that automatically expires overdue leases every hour

\- Live dashboard with aggregated statistics (`/api/dashboard/stats`)



\---



\## 2. Technology Stack



| Layer | Technology |

|---|---|

| Backend | Spring Boot 4, Java 21, Spring Security, Spring Data JPA |

| Database | PostgreSQL |

| Auth | JWT (jjwt), BCrypt |

| Build tool | Maven |

| Frontend | React 18, Vite, React Router, Axios, Context API |



\---



\## 3. Prerequisites



Before running the project, make sure the following are installed:



\- \*\*Java 21\*\* (JDK)

\- \*\*Maven\*\* (or use the included `mvnw` wrapper)

\- \*\*Node.js\*\* (v18+) and \*\*npm\*\*

\- \*\*PostgreSQL\*\* (v14+), running locally or accessible remotely



\---



\## 4. Database Setup



1\. Create a PostgreSQL database named `ApartmentDB`:

&#x20;  ```sql

&#x20;  CREATE DATABASE "ApartmentDB";

&#x20;  ```

2\. The schema is created automatically on first run (`spring.jpa.hibernate.ddl-auto=update`), or you can run the provided `apartment db.sql` script manually against the database.



\---



\## 5. Backend Setup (Spring Boot)



1\. Navigate to the backend folder:

&#x20;  ```bash

&#x20;  cd Apartment

&#x20;  ```

2\. Configure your database credentials in `src/main/resources/application.properties`:

&#x20;  ```properties

&#x20;  spring.datasource.url=jdbc:postgresql://localhost:5432/ApartmentDB

&#x20;  spring.datasource.username=postgres

&#x20;  spring.datasource.password=<your\_password>

&#x20;  ```

3\. Run the application:

&#x20;  ```bash

&#x20;  ./mvnw spring-boot:run

&#x20;  ```

&#x20;  The API will start on \*\*http://localhost:8080\*\*.



\---



\## 6. Frontend Setup (React + Vite)



1\. Navigate to the frontend folder:

&#x20;  ```bash

&#x20;  cd apt-real

&#x20;  ```

2\. Install dependencies:

&#x20;  ```bash

&#x20;  npm install

&#x20;  ```

3\. Start the development server:

&#x20;  ```bash

&#x20;  npm run dev

&#x20;  ```

&#x20;  The application will be available at \*\*http://localhost:5173\*\*.



> The backend only accepts requests from `http://localhost:5173` by default (see `app.cors.allowed-origins` in `application.properties`). Update this value if you serve the frontend from a different origin.



\---



\## 7. Running the Application



1\. Start PostgreSQL and make sure the `ApartmentDB` database exists.

2\. Start the backend (`./mvnw spring-boot:run`) — wait until it logs `Started ApartmentApplication`.

3\. Start the frontend (`npm run dev`).

4\. Open \*\*http://localhost:5173\*\* in your browser.

5\. Register the first account — it is automatically assigned the \*\*ADMIN\*\* role. Subsequent accounts default to \*\*EMPLOYEE\*\*.



\---



\## 8. Project Structure



```

Apartment/               # Spring Boot backend

├── src/main/java/Group6/Apartment/

│   ├── controller/       # REST controllers

│   ├── service/          # Business logic

│   ├── repository/       # Spring Data JPA repositories

│   ├── entity/            # JPA entities

│   ├── dto/               # Request/response objects

│   ├── security/          # JWT filter, user details, utils

│   └── config/            # Security configuration

└── src/main/resources/application.properties



apt-real/                # React frontend

├── src/pages/            # One page per module (Dashboard, Owners, ...)

├── src/components/       # Shared UI components

├── src/services/         # Axios API clients

└── src/context/          # Auth and theme context

```



\---



\## 9. API Documentation



See the accompanying \*\*Project Report\*\* for the full REST API summary and entity-relationship diagram (`ERD.png`).



\---



\## 10. Acknowledgement of AI Tools



Parts of this project's documentation (this README, the ERD diagram, and the project report) were prepared with the assistance of an AI tool (Claude, by Anthropic), based on the team's source code and database schema. All application source code was authored by the project team.

