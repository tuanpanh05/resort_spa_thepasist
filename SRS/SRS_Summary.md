# Software Requirements Specification (SRS) Summary - Ngũ Sơn Resort & Spa

This document provides a high-level summary of the functional requirements, user roles, and operational workflows for the **Ngu Son Resort & Spa Management System (NSRMS)**.

## 👥 System Actors & Roles

1. **Guest / Customer**:
   - Register, login, and manage profile data.
   - Declare personal health notes (allergies, medical conditions) with explicit consent signatures.
   - Browse rooms, villas, and retreat packages.
   - Reserve accommodations and retreat packages.
   - Complete 30% online deposit checkout.
   - Order à la carte food and reserve additional spa services.
   - View invoice ledger and settle payments.
   - Submit service ratings and reviews.
2. **Receptionist**:
   - Manage room reservation statuses (check-in, check-out, confirmations).
   - Distribute health requirements to Chefs and Specialists.
   - Post extra charges (laundry, room service, tours) to the guest folio.
   - Print invoices, collect the 70% remaining balance, and complete checkout.
3. **Wellness Specialist (Therapist/Coach)**:
   - Access guest health summaries and wellness records.
   - Perform scheduled massage, therapy, and yoga sessions.
   - Log medical notes and update patient treatment sheets.
4. **Chef / Kitchen Staff**:
   - Review active dining orders and filter by allergy or dietary warning tags (e.g. peanut allergy, vegan).
   - Prepare therapeutic dishes according to plan requirements.
5. **Manager / Administrator**:
   - Set up master data (rooms, packages, menu catalog, spa listings).
   - Track staff schedules and assignments.
   - Monitor operational metrics and revenue reports.

---

## 🌿 Core Module Requirements

### 1. Authentication & Sensitive Health Profiles
- Security compliant with Decree 356/2025/ND-CP.
- Masking health data so Chefs only see food allergy tags, while Therapists view full medical logs.
- Storing encrypted passport data for police declaration compliance (Residence Law 2020).

### 2. Reservation & Folio Aggregation
- Support standard room bookings as well as package bookings (which bundle room, spa limits, and food limits).
- Track deposits and billing transactions.

### 3. Spa Scheduling Engine
- Map customer, qualified therapist, vacant therapy room, and time.
- Deduct complimentary spa sessions for package guests, or post à la carte charges for standard bookings.

### 4. Dietary & Food Ordering
- Filter menu items by tags (`Vegan`, `Keto`, `Gluten-Free`).
- Prevent allergy incidents by flagging special prep warnings in kitchen order tickets.

### 5. Consolidated Billing (AHLEI Folio Standard)
- Aggregate all point-of-sale debts (lodging, spa, food) into a single invoice.
- Settle payments securely via online gateways (VNPay).
