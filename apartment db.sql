-- ============================
-- USERS
-- ============================
CREATE TABLE Users (
    user_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- OWNERS
-- ============================
CREATE TABLE Owners (
    owner_id BIGSERIAL PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- APARTMENTS
-- ============================
CREATE TABLE Apartments (
    apartment_id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES Owners(owner_id) ON DELETE CASCADE,
    apartment_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    total_floors INT NOT NULL,
    total_units INT NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- APARTMENT UNITS
-- ============================
CREATE TABLE ApartmentUnits (
    unit_id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES Apartments(apartment_id) ON DELETE CASCADE,
    unit_number VARCHAR(20) NOT NULL,
    floor_no INT NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    kitchens INT NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- TENANTS
-- ============================
CREATE TABLE Tenants (
    tenant_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    national_id VARCHAR(30) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- LEASES
-- ============================
CREATE TABLE Leases (
    lease_id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    unit_id BIGINT NOT NULL REFERENCES ApartmentUnits(unit_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    lease_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (lease_status IN ('ACTIVE','EXPIRED','TERMINATED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- PAYMENTS
-- ============================
CREATE TABLE Payments (
    payment_id BIGSERIAL PRIMARY KEY,
    lease_id BIGINT NOT NULL REFERENCES Leases(lease_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) DEFAULT 'PAID' CHECK (payment_status IN ('PAID','PENDING','OVERDUE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- MAINTENANCE REQUESTS
-- ============================
CREATE TABLE MaintenanceRequests (
    request_id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT NOT NULL REFERENCES ApartmentUnits(unit_id) ON DELETE CASCADE,
    assigned_user_id BIGINT REFERENCES Users(user_id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED')),
    request_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



select * from Users 
