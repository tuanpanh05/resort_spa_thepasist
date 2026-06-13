# Implementation Plan - Spring Boot Backend MVC Structure for Ngu Son Resort & Spa

This plan outlines the initialization of a Maven-based Spring Boot project under the `Backend` directory of the workspace, structured to be opened and run directly in IntelliJ IDEA.

## User Review Required

> [!IMPORTANT]
> 1. **Project Stack**: We will configure a **Maven** project using **Java 21** and **Spring Boot 3.4.x / 3.5.x** with Lombok, Spring Data JPA, Spring Security, Validation, and the MS SQL Server JDBC driver.
> 2. **Package Structure**: The package will be `fu.se.smms` as defined in the Software Design Specification (SDS).
> 3. **The "View" Component**: Since this is a REST API architecture designed for a React frontend, the primary "View" is the React app itself. However, to fulfill the "MVC View" requirement natively within Spring Boot, we will create a **premium, premium-styled API status dashboard** in the static resources (`src/main/resources/static/index.html`). This dashboard will render a sleek glassmorphism monitoring panel when accessing `http://localhost:8080/`.
> 4. **Core Classes**: Rather than bloating the project with empty boilerplates, we will implement full functional classes for the **core business modules** (Authentication, User Profiles, Room Bookings, and Spa Scheduling) as a reference for all other components.

## Proposed Changes

We will create the Maven structure and Java source code folders under `c:/Users/Administrator/Videos/SWP391_G3/Backend`.

```text
Backend/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── fu/
        │       └── se/
        │           └── smms/
        │               ├── SmmsApplication.java
        │               ├── config/
        │               ├── controller/
        │               ├── dto/
        │               ├── entity/
        │               ├── repository/
        │               └── service/
        │                   └── impl/
        └── resources/
            ├── application.properties
            └── static/
                └── index.html (API Dashboard View)
```

### Build & Configuration

#### [NEW] [pom.xml](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/pom.xml)
Maven Project Object Model defining dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `lombok`
- `mssql-jdbc`

#### [NEW] [application.properties](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/src/main/resources/application.properties)
Properties mapping to port `8080`, context-path `/api`, and linking to MS SQL Server `ResortSpaDB`.

### Core Backend Classes

#### [NEW] [SmmsApplication.java](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/src/main/java/fu/se/smms/SmmsApplication.java)
The standard Spring Boot Application entry point.

#### [NEW] [Entities](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/src/main/java/fu/se/smms/entity)
JPA Entities mapping directly to our database columns:
- `User.java`: Complete user mapping (Managers, Chefs, Therapists, Customers).
- `MedicalProfile.java`: 1-to-1 medical profile mapping.
- `RoomBooking.java`: Master accommodation and package reservation folio.

#### [NEW] [Repositories](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/src/main/java/fu/se/smms/repository)
Spring Data JPA Repository interfaces:
- `UserRepository.java`
- `MedicalProfileRepository.java`
- `RoomBookingRepository.java`

#### [NEW] [DTOs](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/src/main/java/fu/se/smms/dto)
Data Transfer Objects representing API request and response boundaries:
- `LoginRequestDTO.java`, `LoginResponseDTO.java`
- `UserProfileDTO.java`
- `RoomBookingDTO.java`

#### [NEW] [Services](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/src/main/java/fu/se/smms/service)
Business service interfaces and implementations:
- `UserService.java` & `UserServiceImpl.java`
- `RoomBookingService.java` & `RoomBookingServiceImpl.java`

#### [NEW] [Controllers](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/src/main/java/fu/se/smms/controller)
RestControllers handling requests and returning DTOs:
- `AuthenticationController.java`
- `UserController.java`
- `RoomBookingController.java`

### The View Component (Static Panel)

#### [NEW] [index.html](file:///c:/Users/Administrator/Videos/SWP391_G3/Backend/src/main/resources/static/index.html)
A premium dark-themed API control panel served as the landing page of the backend to monitor active services, showcase endpoints, and fulfill the MVC view layer with style.

---

## Verification Plan

### Automated & Manual Verification
1. **Compilation Validation**: Ensure all Java files compile cleanly without syntax or import errors.
2. **Endpoint Mappings Audit**: Confirm controller paths map correctly to `/api/auth/...`, `/api/users/...`, `/api/bookings/...` matching the frontend context.
3. **Static Resource Resolution**: Ensure the landing page dashboard can be served from `static/index.html`.
