-- TrustFix database schema + demo seed data
-- Import with: mysql -u root -p < database/trustfix.sql
-- All demo accounts use the password: Password123

CREATE DATABASE IF NOT EXISTS trustfix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE trustfix;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_providers;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------- Users
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  city VARCHAR(80) NOT NULL,
  role ENUM('customer', 'provider') NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE = InnoDB;

-- --------------------------------------------------------------- Customers
CREATE TABLE customers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_user (user_id),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- -------------------------------------------------------------- Categories
CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL,
  slug VARCHAR(60) NOT NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE = InnoDB;

-- -------------------------------------------------------- Service providers
CREATE TABLE service_providers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  experience_years TINYINT UNSIGNED NOT NULL DEFAULT 0,
  address VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_providers_user (user_id),
  KEY idx_providers_category (category_id),
  CONSTRAINT fk_providers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_providers_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------- Services
CREATE TABLE services (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_services_provider (provider_id),
  KEY idx_services_category (category_id),
  CONSTRAINT fk_services_provider FOREIGN KEY (provider_id) REFERENCES service_providers (id) ON DELETE CASCADE,
  CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------- Bookings
CREATE TABLE bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id INT UNSIGNED NOT NULL,
  provider_id INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  problem_description TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  address VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  status ENUM(
    'pending',
    'accepted',
    'rejected',
    'in_progress',
    'completed',
    'cancelled'
  ) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_customer_status (customer_id, status),
  KEY idx_bookings_provider_status (provider_id, status),
  KEY idx_bookings_service (service_id),
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_provider FOREIGN KEY (provider_id) REFERENCES service_providers (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services (id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------- Reviews
CREATE TABLE reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id INT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED NOT NULL,
  provider_id INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_booking (booking_id),
  KEY idx_reviews_provider (provider_id),
  KEY idx_reviews_service (service_id),
  CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_provider FOREIGN KEY (provider_id) REFERENCES service_providers (id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_service FOREIGN KEY (service_id) REFERENCES services (id),
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE = InnoDB;

-- =============================================================== Seed data

INSERT INTO categories (id, name, slug, description) VALUES
  (1, 'Electrician', 'electrician', 'Wiring, switches, fans and electrical fixes.'),
  (2, 'Plumbing', 'plumbing', 'Leaks, taps, drains and pipe installations.'),
  (3, 'AC Repair', 'ac-repair', 'Servicing, gas refills and cooling repairs.'),
  (4, 'Home Cleaning', 'home-cleaning', 'Deep cleaning for homes and apartments.'),
  (5, 'Carpentry', 'carpentry', 'Furniture repair, fittings and custom woodwork.'),
  (6, 'Painting', 'painting', 'Interior and exterior painting with clean finishes.'),
  (7, 'Appliance Repair', 'appliance-repair', 'Washing machines, fridges and microwaves.'),
  (8, 'Computer Repair', 'computer-repair', 'Laptop servicing, upgrades and troubleshooting.');

-- bcrypt hash for "Password123"
SET @demo_password = '$2b$10$lP1Vs0zKsvSBfs2XIMGpjuQ1C0LwzdeaYhXkcFF3WLAxT1Tv556Om';

INSERT INTO users (id, full_name, email, phone, city, role, password_hash) VALUES
  (1, 'Ananya Sharma', 'customer@trustfix.com', '9876543210', 'Bengaluru', 'customer', @demo_password),
  (2, 'Rahul Verma', 'provider@trustfix.com', '9876500011', 'Bengaluru', 'provider', @demo_password),
  (3, 'Rohit Mehta', 'rohit@example.com', '9812345678', 'Bengaluru', 'customer', @demo_password),
  (4, 'Priya Desai', 'priya@example.com', '9823456789', 'Mumbai', 'customer', @demo_password),
  (5, 'Meera Iyer', 'meera@trustfix.com', '9876500022', 'Bengaluru', 'provider', @demo_password),
  (6, 'Arjun Nair', 'arjun@trustfix.com', '9876500033', 'Bengaluru', 'provider', @demo_password),
  (7, 'Fatima Khan', 'fatima@trustfix.com', '9876500044', 'Mumbai', 'provider', @demo_password),
  (8, 'Vikram Singh', 'vikram@trustfix.com', '9876500055', 'Delhi', 'provider', @demo_password),
  (9, 'Neha Gupta', 'neha@trustfix.com', '9876500066', 'Pune', 'provider', @demo_password),
  (10, 'Suresh Patil', 'suresh@trustfix.com', '9876500077', 'Hyderabad', 'provider', @demo_password),
  (11, 'Aditya Rao', 'aditya@trustfix.com', '9876500088', 'Bengaluru', 'provider', @demo_password);

INSERT INTO customers (id, user_id, address) VALUES
  (1, 1, '14, Palm Grove Apartments, Indiranagar, Bengaluru'),
  (2, 3, '22, Rose Villa, Koramangala, Bengaluru'),
  (3, 4, '8, Lakeview Residency, Andheri West, Mumbai');

INSERT INTO service_providers
  (id, user_id, category_id, experience_years, address, description, rating, review_count, is_featured)
VALUES
  (1, 2, 1, 6, '12, Green Park, Jayanagar, Bengaluru',
   'Licensed electrician handling wiring, fan installation, switchboards and fault finding. I carry my own tools and clean up after every job.',
   0, 0, 1),
  (2, 5, 2, 8, '5, Sunrise Layout, HSR Layout, Bengaluru',
   'Plumber with eight years of experience in residential repairs, bathroom fittings and leak detection. Honest estimates before any work begins.',
   0, 0, 1),
  (3, 6, 3, 5, '31, Lake Road, Whitefield, Bengaluru',
   'AC technician specialising in split and window units. Deep servicing, gas refills and cooling repairs with a one-month workmanship guarantee.',
   0, 0, 0),
  (4, 7, 4, 4, '17, Sea Breeze, Bandra West, Mumbai',
   'Detail-focused home cleaning team for apartments, sofas and kitchens. Eco-friendly products and a checklist you can review before we finish.',
   0, 0, 1),
  (5, 8, 5, 10, '9, Woodcraft Lane, Saket, Delhi',
   'Carpenter building and repairing furniture, doors and modular cabinets. Precise fittings, solid materials and neat finishing.',
   0, 0, 0),
  (6, 9, 6, 7, '44, Hill View, Kothrud, Pune',
   'Painter for interiors and exteriors with clean masking and low-odour paints. Clear timelines and a walkthrough before handover.',
   0, 0, 0),
  (7, 10, 7, 9, '2, Metro Enclave, Banjara Hills, Hyderabad',
   'Appliance repair specialist for washing machines, refrigerators and microwaves. Diagnosis first, then a fixed quote before any repair.',
   0, 0, 0),
  (8, 11, 8, 3, '18, Tech Park Road, Marathahalli, Bengaluru',
   'Computer technician for laptops and desktops. Hardware upgrades, virus removal, data backup and honest advice on whether a repair is worth it.',
   0, 0, 0);

INSERT INTO services (id, provider_id, category_id, title, description, price, duration_minutes) VALUES
  (1, 1, 1, 'Ceiling fan installation', 'Installation of one ceiling fan, including mounting, wiring and a balance check. Suitable for concrete or false ceilings.', 499.00, 60),
  (2, 1, 1, 'Switch and socket repair', 'Diagnosis and repair of faulty switches, sockets or a single circuit. Includes replacement of one standard switch or socket.', 349.00, 45),
  (3, 1, 1, 'Full house wiring inspection', 'A room-by-room electrical safety inspection with a written list of issues, load observations and recommended fixes.', 1299.00, 120),
  (4, 2, 2, 'Leak repair', 'Locate and repair a visible pipe or fitting leak, including resealing and a pressure check. Parts billed separately if needed.', 399.00, 45),
  (5, 3, 3, 'AC deep service', 'Complete split AC service: filter cleaning, coil wash, drain clearing and a cooling performance check.', 899.00, 90),
  (6, 2, 2, 'Tap and mixer installation', 'Installation of one kitchen or bathroom tap or mixer, including connection checks and leak testing.', 299.00, 30),
  (7, 4, 4, '2BHK deep cleaning', 'Full apartment deep clean covering kitchen, bathrooms, floors, windows, fans and skirting. Brings own supplies and equipment.', 2499.00, 240),
  (8, 4, 4, 'Sofa shampoo cleaning', 'Shampoo and extraction cleaning for up to five sofa seats, including cushions and spot treatment.', 999.00, 90),
  (9, 5, 5, 'Kitchen cabinet repair', 'Repair of hinges, drawers, channels and loose panels on up to three kitchen cabinets. Materials quoted separately.', 799.00, 90),
  (10, 5, 5, 'Door alignment and repair', 'Fix a sticking, sagging or noisy door, including hinge adjustment, planing and latch alignment.', 449.00, 60),
  (11, 6, 6, 'Single room interior painting', 'Preparation, masking and two coats of premium emulsion for one standard room up to 120 sq ft. Paint cost included.', 3999.00, 480),
  (12, 7, 7, 'Washing machine repair', 'Inspection and repair of front-load or top-load washing machines. Covers common drainage, spin and control issues.', 549.00, 60),
  (13, 7, 7, 'Refrigerator repair', 'Diagnosis and repair for cooling, frosting or leakage problems in single-door and double-door refrigerators.', 699.00, 75),
  (14, 8, 8, 'Laptop service and cleanup', 'Interior cleaning, thermal paste replacement, software cleanup and a performance check for one laptop.', 699.00, 60),
  (15, 8, 8, 'Operating system reinstall', 'Backup of personal files, clean OS installation, driver setup and essential application configuration.', 499.00, 45);

INSERT INTO bookings
  (id, customer_id, provider_id, service_id, problem_description, preferred_date, address, contact_number, status, created_at)
VALUES
  (1, 1, 1, 1, 'The ceiling fan in my bedroom has stopped spinning and makes a humming sound. The regulator also feels warm. Please bring a spare capacitor if needed.', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14, Palm Grove Apartments, Indiranagar, Bengaluru', '9876543210', 'pending', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (2, 1, 2, 4, 'There is a slow leak under the kitchen sink. A bucket fills up in about a day. The cabinet below is starting to swell.', DATE_SUB(CURDATE(), INTERVAL 10 DAY), '14, Palm Grove Apartments, Indiranagar, Bengaluru', '9876543210', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
  (3, 1, 4, 7, 'Need a full deep clean before family visits next week. Two bedrooms, kitchen and bathrooms. Please bring supplies for the sofa too if possible.', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '14, Palm Grove Apartments, Indiranagar, Bengaluru', '9876543210', 'accepted', DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (4, 2, 1, 2, 'The bedroom switch sparks when I turn on the light. I have stopped using it. Please check the socket next to it as well.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '22, Rose Villa, Koramangala, Bengaluru', '9812345678', 'pending', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  (5, 3, 1, 3, 'We recently moved in and want the wiring checked before installing a new geyser and air conditioner.', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '8, Lakeview Residency, Andheri West, Mumbai', '9823456789', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (6, 2, 3, 5, 'The split AC is running but not cooling properly. It has not been serviced in over a year.', DATE_SUB(CURDATE(), INTERVAL 12 DAY), '22, Rose Villa, Koramangala, Bengaluru', '9812345678', 'completed', DATE_SUB(NOW(), INTERVAL 12 DAY)),
  (7, 3, 4, 7, 'Deep cleaning for a 2BHK before moving out. Kitchen chimney and bathroom tiles need extra attention.', DATE_SUB(CURDATE(), INTERVAL 20 DAY), '8, Lakeview Residency, Andheri West, Mumbai', '9823456789', 'completed', DATE_SUB(NOW(), INTERVAL 20 DAY)),
  (8, 2, 5, 9, 'Two kitchen cabinet doors are hanging loose and one drawer channel is broken. Please bring standard hinges.', DATE_SUB(CURDATE(), INTERVAL 15 DAY), '22, Rose Villa, Koramangala, Bengaluru', '9812345678', 'completed', DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (9, 3, 6, 11, 'Need one bedroom painted in a light neutral shade. Walls have a few small cracks that should be filled first.', DATE_SUB(CURDATE(), INTERVAL 25 DAY), '8, Lakeview Residency, Andheri West, Mumbai', '9823456789', 'completed', DATE_SUB(NOW(), INTERVAL 25 DAY)),
  (10, 2, 7, 12, 'The washing machine stops before the spin cycle and leaves water inside. Front-load, four years old.', DATE_SUB(CURDATE(), INTERVAL 8 DAY), '22, Rose Villa, Koramangala, Bengaluru', '9812345678', 'completed', DATE_SUB(NOW(), INTERVAL 8 DAY)),
  (11, 1, 8, 14, 'Laptop fans are very loud and it gets hot during calls. Please clean it and check whether the thermal paste needs replacing.', DATE_SUB(CURDATE(), INTERVAL 18 DAY), '14, Palm Grove Apartments, Indiranagar, Bengaluru', '9876543210', 'completed', DATE_SUB(NOW(), INTERVAL 18 DAY)),
  (12, 1, 1, 3, 'Electrical safety check before we start using the spare room as a home office.', DATE_SUB(CURDATE(), INTERVAL 30 DAY), '14, Palm Grove Apartments, Indiranagar, Bengaluru', '9876543210', 'completed', DATE_SUB(NOW(), INTERVAL 30 DAY));

INSERT INTO reviews (id, booking_id, customer_id, provider_id, service_id, rating, comment, created_at) VALUES
  (1, 2, 1, 2, 4, 5, 'Meera found the leak quickly and replaced the worn washer. She explained what caused it and left the cabinet dry and tidy.', DATE_SUB(NOW(), INTERVAL 9 DAY)),
  (2, 5, 3, 1, 3, 4, 'Rahul was punctual and thorough. The inspection report was clear and he did not push any unnecessary work.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (3, 6, 2, 3, 5, 5, 'Excellent AC service. The cooling improved immediately and Arjun cleaned up everything afterwards.', DATE_SUB(NOW(), INTERVAL 11 DAY)),
  (4, 7, 3, 4, 7, 4, 'The team worked hard and the kitchen looked spotless. They were slightly late, but kept us informed.', DATE_SUB(NOW(), INTERVAL 19 DAY)),
  (5, 8, 2, 5, 9, 5, 'Vikram fixed both cabinet doors and the drawer in under an hour. Very neat work and a fair price.', DATE_SUB(NOW(), INTERVAL 14 DAY)),
  (6, 9, 3, 6, 11, 4, 'Neha filled the wall cracks properly and the finish is smooth. She protected the furniture before starting.', DATE_SUB(NOW(), INTERVAL 24 DAY)),
  (7, 10, 2, 7, 12, 5, 'Suresh diagnosed a blocked drain pump and fixed it the same visit. He showed me the part he replaced.', DATE_SUB(NOW(), INTERVAL 7 DAY)),
  (8, 11, 1, 8, 14, 4, 'The laptop is noticeably cooler and quieter now. Aditya also removed a lot of unnecessary startup software.', DATE_SUB(NOW(), INTERVAL 17 DAY)),
  (9, 12, 1, 1, 3, 5, 'Second time hiring Rahul. Clear report, sensible recommendations and no pressure to spend more.', DATE_SUB(NOW(), INTERVAL 29 DAY));

-- Keep profile ratings consistent with the seeded reviews.
UPDATE service_providers p
SET
  rating = COALESCE((SELECT ROUND(AVG(r.rating), 2) FROM reviews r WHERE r.provider_id = p.id), 0.00),
  review_count = (SELECT COUNT(*) FROM reviews r WHERE r.provider_id = p.id);
