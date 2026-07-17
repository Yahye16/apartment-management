# Apartment Management System — Frontend

A React (Vite) frontend built specifically for the **Group 6 Apartment Management
API** (Spring Boot + PostgreSQL). This connects to a real backend over HTTP —
there is no mock data here.

## Project layout

```
src/
├── main.jsx              # React entry point
├── App.jsx                # Routes + overall page layout
├── index.css               # All styling (navy/teal/gold theme)
├── context/
│   └── AuthContext.jsx     # Keeps track of the logged-in user everywhere
├── services/                # One file per backend resource - each function
│   │                         # maps to exactly one API endpoint
│   ├── apiClient.js         # Axios instance + attaches the JWT to every request
│   ├── authService.js       # /api/auth/**
│   ├── ownerService.js      # /api/owners/**
│   ├── apartmentService.js  # /api/apartments/**
│   ├── unitService.js       # /api/units/**
│   ├── tenantService.js     # /api/tenants/**
│   ├── leaseService.js      # /api/leases/**
│   ├── paymentService.js    # /api/payments/**
│   ├── maintenanceService.js# /api/maintenance-requests/**
│   └── dashboardService.js  # /api/dashboard/stats
├── components/
│   ├── Sidebar.jsx          # Left-hand navigation menu
│   ├── PrivateRoute.jsx     # Blocks a page if nobody is logged in
│   ├── LoadingState.jsx     # Small spinner shown while data loads
│   ├── EmptyState.jsx       # "Nothing here yet" message
│   └── StatusBadge.jsx      # Colored pill for status/priority values
├── pages/                    # One page per menu item, each following the
│   │                          # same pattern: load list -> show table ->
│   │                          # open a modal form to create/edit -> delete
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Owners.jsx
│   ├── Apartments.jsx
│   ├── Units.jsx
│   ├── Tenants.jsx
│   ├── Leases.jsx
│   ├── Payments.jsx
│   └── MaintenanceRequests.jsx
└── utils/
    └── getErrorMessage.js    # Turns the backend's error JSON into one string
```

Every CRUD page (Owners, Apartments, Units, Tenants, Leases, Payments,
Maintenance Requests) follows the **same** structure on purpose:

1. `useEffect` loads the list (and any related dropdown data) when the page opens.
2. The list is rendered as a table, with an "Edit" and "Delete" button per row.
3. "+ New ..." and "Edit" both open the same modal form; `editingId` tells the
   form whether it's creating or updating.
4. `validate()` checks the required fields before anything is sent to the API.
5. Submitting calls the matching service function and reloads the list.

Once you understand one page, you understand all of them.

## Running it

1. Make sure the Spring Boot backend from this project is running on
   `http://localhost:8080` (its `application.properties` already allows
   CORS requests from `http://localhost:5173`, which is Vite's default port).
2. Install and start the frontend:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`, click **Register**, and create an account.
   The very first account ever registered automatically becomes `ADMIN`
   (see `AuthController.registerUser` on the backend) — every account after
   that is an `EMPLOYEE`. Both roles can use every page in this app, since
   the backend doesn't currently restrict any endpoint by role beyond
   requiring you to be logged in.

## How data connects together

```
Owner ──< Apartment ──< ApartmentUnit ──< Lease >── Tenant
                              │                        
                              ├──< MaintenanceRequest    
                              │                          
                          Lease ──< Payment              
```

- An **Owner** owns many **Apartments**.
- An **Apartment** has many **Units**.
- A **Unit** can have many **Leases** over time (one **Tenant** per lease).
- A **Lease** can have many **Payments**.
- A **Unit** can have many **Maintenance Requests**, optionally assigned to
  a staff **User** (there's no endpoint yet to list users, so assigning uses
  a plain "enter a user ID" prompt).

## A couple of things worth knowing

- **Relations are locked in at creation time.** For example, once an
  Apartment is created for an Owner, you can edit its name/floors/status,
  but you can't move it to a different Owner — that matches how the backend
  service methods (`ApartmentService.update`, `LeaseService.update`, etc.)
  are written; they never touch the relationship fields.
- **Creating a Lease automatically marks its Unit `OCCUPIED`.** Setting a
  Lease's status to `TERMINATED` or `EXPIRED` automatically frees the Unit
  back to `AVAILABLE`. This logic lives on the backend, not here.
- **Error messages**: the backend returns either `{ message: "..." }` or
  `{ errors: { field: "..." } }` for validation failures. `getErrorMessage()`
  in `src/utils/` reads whichever one is present so every page can show a
  useful message without repeating that logic.
