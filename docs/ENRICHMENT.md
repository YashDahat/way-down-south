# Feature Enrichment — Attempt 1

Generated: 2026-06-13

Each section is one LLM call (~5–8K tokens). The instruction tells the generator how all files in the feature interact and what contracts they must honour.

---

## Shared Backend Models and Repositories

**Name:** `shared-models-repos`  
**Type:** SHARED  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/waydownsouth/model/User.java` — MODEL layer — defines the User entity schema for JPA persistence, including fields for authentication (email, passwordHash) and authorization (role).
- `backend/src/main/java/com/waydownsouth/model/Role.java` — MODEL layer — defines the Role enumeration (ADMIN, CUSTOMER) used by the User entity and Spring Security for authorization.
- `backend/src/main/java/com/waydownsouth/repository/UserRepository.java` — REPOSITORY layer — provides data access methods for the User entity, including the critical findByEmail(String email) method used by the UserService for authentication.
- `backend/src/main/java/com/waydownsouth/exception/GlobalExceptionHandler.java` — EXCEPTION layer — provides centralized exception handling for all controllers, translating Java exceptions into structured JSON ErrorResponse objects with appropriate HTTP status codes.
- `backend/src/main/java/com/waydownsouth/dto/ErrorResponse.java` — DTO layer — defines the standard JSON structure for all error responses returned by the API, ensuring consistent error handling for clients.

**Feature Instruction:**

This feature establishes the foundational data models, repositories, and exception handling for the entire Way Down South backend. It is a shared feature providing common components used by other backend services.

### `Role.java` - User Role Enumeration

Create a public enum `com.waydownsouth.model.Role`.

- **Enum Constants:**
  - `ADMIN`: Represents an administrator user.
  - `CUSTOMER`: Represents a standard customer user.

### `User.java` - User Entity Model

Create a JPA entity class `com.waydownsouth.model.User` that also implements Spring Security's `UserDetails` interface.

- **Class-level Annotations:**
  - `@Entity`
  - `@Table(name = "users")`
  - `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` (from Lombok for boilerplate code).

- **Fields:**
  - `private UUID id`: The primary key.
    - Annotations: `@Id`, `@GeneratedValue(strategy = GenerationType.UUID)`.
  - `private String email`: The user's login email. Must be unique.
    - Annotations: `@Column(unique = true, nullable = false)`.
  - `private String passwordHash`: The BCrypt-hashed password.
    - Annotations: `@Column(nullable = false)`.
  - `private Role role`: The user's role.
    - Annotations: `@Enumerated(EnumType.STRING)`, `@Column(nullable = false)`.

- **`UserDetails` Implementation:**
  - `public Collection<? extends GrantedAuthority> getAuthorities()`: Return a `List.of(new SimpleGrantedAuthority(role.name()))`.
  - `public String getPassword()`: Return the `passwordHash` field.
  - `public String getUsername()`: Return the `email` field.
  - `public boolean isAccountNonExpired()`: Return `true`.
  - `public boolean isAccountNonLocked()`: Return `true`.
  - `public boolean isCredentialsNonExpired()`: Return `true`.
  - `public boolean isEnabled()`: Return `true`.

### `UserRepository.java` - User Data Access

Create a public interface `com.waydownsouth.repository.UserRepository` that extends `JpaRepository<User, UUID>`.

- **Methods:**
  - `Optional<User> findByEmail(String email)`: This method will be used by `UserService` in the `authentication-backend` feature to fetch users during the login process. Spring Data JPA will provide the implementation automatically.

### `ErrorResponse.java` - Standardized Error DTO

Create a public DTO class `com.waydownsouth.dto.ErrorResponse` to ensure all API errors have a consistent JSON structure. A Java `record` is suitable here.

- **Fields:**
  - `LocalDateTime timestamp`: The time the error occurred.
  - `int status`: The HTTP status code.
  - `String error`: The HTTP status reason phrase (e.g., "Not Found").
  - `String message`: A developer-friendly error message.
  - `String path`: The API path that was requested.

### `GlobalExceptionHandler.java` - Centralized Exception Handling

Create a class `com.waydownsouth.exception.GlobalExceptionHandler` to handle exceptions across all controllers.

- **Class-level Annotation:** `@ControllerAdvice`

- **Methods:**

  1.  **`handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request)`**
      - **Signature:** `public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request)`
      - **Annotation:** `@ExceptionHandler(ResourceNotFoundException.class)`
      - **Logic:**
        1.  Create a new `ErrorResponse` object.
        2.  Set `timestamp` to `LocalDateTime.now()`.
        3.  Set `status` to `HttpStatus.NOT_FOUND.value()` (404).
        4.  Set `error` to `HttpStatus.NOT_FOUND.getReasonPhrase()`.
        5.  Set `message` to `ex.getMessage()`.
        6.  Set `path` to `((ServletWebRequest)request).getRequest().getRequestURI()`.
        7.  Return a new `ResponseEntity` containing the `ErrorResponse` and `HttpStatus.NOT_FOUND`.
      - **Note:** `ResourceNotFoundException` is a custom runtime exception you will create in the `com.waydownsouth.exception` package. It should have a constructor that accepts a `String message`.

  2.  **`handleAccessDeniedException(AccessDeniedException ex, WebRequest request)`**
      - **Signature:** `public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, WebRequest request)`
      - **Annotation:** `@ExceptionHandler(AccessDeniedException.class)`
      - **Logic:**
        1.  Create a new `ErrorResponse` object.
        2.  Set `timestamp` to `LocalDateTime.now()`.
        3.  Set `status` to `HttpStatus.FORBIDDEN.value()` (403).
        4.  Set `error` to `HttpStatus.FORBIDDEN.getReasonPhrase()`.
        5.  Set `message` to `ex.getMessage()`.
        6.  Set `path` to `((ServletWebRequest)request).getRequest().getRequestURI()`.
        7.  Return a new `ResponseEntity` containing the `ErrorResponse` and `HttpStatus.FORBIDDEN`.

  3.  **`handleMethodArgumentNotValid(MethodArgumentNotValidException ex, WebRequest request)`**
      - **Signature:** `public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, WebRequest request)`
      - **Annotation:** `@ExceptionHandler(MethodArgumentNotValidException.class)`
      - **Logic:**
        1.  Extract validation errors from `ex.getBindingResult().getFieldErrors()`.
        2.  Map each `FieldError` to a string like "`fieldName`: `defaultMessage`".
        3.  Join these strings with a comma and space.
        4.  Create a new `ErrorResponse` object.
        5.  Set `timestamp` to `LocalDateTime.now()`.
        6.  Set `status` to `HttpStatus.BAD_REQUEST.value()` (400).
        7.  Set `error` to `HttpStatus.BAD_REQUEST.getReasonPhrase()`.
        8.  Set `message` to the joined validation error string.
        9.  Set `path` to `((ServletWebRequest)request).getRequest().getRequestURI()`.
        10. Return a new `ResponseEntity` containing the `ErrorResponse` and `HttpStatus.BAD_REQUEST`.

### Inter-Feature Wiring

- `User.java` uses `Role.java` for its `role` field.
- `UserRepository.java` is the repository for the `User` entity.
- `GlobalExceptionHandler.java` constructs `ErrorResponse` objects for its responses.
- This feature does not call other features. Instead, its components (`User`, `UserRepository`, `GlobalExceptionHandler`) will be used by nearly all other backend features, particularly `authentication-backend` which will inject `UserRepository` into its `UserService`.

---

## Authentication (Backend)

**Name:** `authentication-backend`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/waydownsouth/controller/AuthController.java` — CONTROLLER layer — exposes the public /api/v1/auth/login endpoint. It receives login credentials, uses the authentication manager to validate them, and calls JwtUtil.generateToken() to create a token for the client.
- `backend/src/main/java/com/waydownsouth/dto/AuthRequest.java` — DTO layer — defines the request body for the login endpoint, specifying the required email and password fields with validation constraints (@NotBlank, @Email).
- `backend/src/main/java/com/waydownsouth/dto/AuthResponse.java` — DTO layer — defines the JSON response body after a successful login, providing the client with the JWT token, user role, and token expiration time.
- `backend/src/main/java/com/waydownsouth/service/UserService.java` — SERVICE layer — implements Spring Security's UserDetailsService interface. Its core method, loadUserByUsername(String email), is called by the authentication manager to fetch user details from the UserRepository during the login process.
- `backend/src/main/java/com/waydownsouth/util/JwtUtil.java` — UTIL layer — provides static methods for JWT management. Key methods are generateToken(UserDetails), called by AuthController, and validateToken(String, UserDetails) and extractEmail(String), called by JwtAuthFilter.
- `backend/src/main/java/com/waydownsouth/security/JwtAuthFilter.java` — CONFIG layer — implements a OncePerRequestFilter to inspect the Authorization header of incoming requests. It uses JwtUtil to validate the token and UserService to load user details, setting the authentication context if the token is valid.
- `backend/src/main/java/com/waydownsouth/config/SecurityConfig.java` — CONFIG layer — central hub for Spring Security. It defines which endpoints are public (e.g., GET /api/v1/**, POST /api/v1/auth/login) and which are protected (e.g., /api/v1/admin/**), and registers the JwtAuthFilter in the security chain.
- `backend/src/main/java/com/waydownsouth/config/AdminInitializer.java` — CONFIG layer — implements CommandLineRunner to execute on application startup. It ensures an initial ADMIN user exists by checking the UserRepository, creating one from environment variables if necessary.

**Feature Instruction:**

This feature implements the complete authentication and authorization layer for the Way Down South application using Spring Security and JSON Web Tokens (JWT). It includes user login, token generation, token validation via a request filter, and initial admin user setup.

### DTOs (Data Transfer Objects)

**1. `AuthRequest.java`**
This class is a simple POJO representing the JSON body for a login request.
- **Fields:**
  - `private String email;`: Must be annotated with `@NotBlank` and `@Email` for validation.
  - `private String password;`: Must be annotated with `@NotBlank`.
- Include standard getters, setters, and a no-args constructor.

**2. `AuthResponse.java`**
This class is a POJO representing the JSON response upon successful authentication.
- **Fields:**
  - `private String token;`: The generated JWT.
  - `private String role;`: The user's role (e.g., "ADMIN").
  - `private long expiresAt;`: The token's expiration timestamp in epoch milliseconds.
- Include a constructor that accepts all three fields, along with standard getters and setters.

### Service Layer

**1. `UserService.java`**
This service implements Spring Security's `UserDetailsService` to fetch user data from the database.
- **Annotations:** `@Service`.
- **Dependencies:** Inject `UserRepository` from the `shared-models-repos` feature.
- **Methods:**
  - `public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException`:
    1. Call `userRepository.findByEmail(email)` to find the user.
    2. If the `Optional<User>` is empty, throw a `UsernameNotFoundException` with the message "User not found with email: " + email.
    3. If the user is found, get the `User` object.
    4. Create a `List<GrantedAuthority>` containing a single `SimpleGrantedAuthority`. The authority string should be the user's role name (e.g., `user.getRole().name()`).
    5. Return a new `org.springframework.security.core.userdetails.User` object, passing the user's email, password, and the created authorities list to its constructor.

### Utility Layer

**1. `JwtUtil.java`**
This utility class handles all JWT-related operations.
- **Annotations:** `@Component`.
- **Configuration Properties:**
  - Inject a JWT secret key from `application.properties`: `@Value("${jwt.secret}") private String secretKey;`
  - Inject the JWT expiration time: `@Value("${jwt.expiration.ms}") private long jwtExpirationMs;`
- **Methods:**
  - `public String generateToken(UserDetails userDetails)`:
    1. Create an empty `HashMap<String, Object>` for extra claims.
    2. Extract the user's role from `userDetails.getAuthorities()`. Get the first authority and add it to the claims map with the key "role".
    3. Use `Jwts.builder()` to construct the token.
    4. Set the claims using `.setClaims(claims)`.
    5. Set the subject using `.setSubject(userDetails.getUsername())`.
    6. Set the issued-at date: `.setIssuedAt(new Date(System.currentTimeMillis()))`.
    7. Set the expiration date: `.setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))`.
    8. Sign the token with `HS256` algorithm and the `secretKey`: `.signWith(getSigningKey(), SignatureAlgorithm.HS256)`.
    9. Return the compacted token string using `.compact()`.
  - `public String extractEmail(String token)`:
    1. This is a convenience method. Call `extractClaim(token, Claims::getSubject)` to get the email.
  - `public boolean validateToken(String token, UserDetails userDetails)`:
    1. Extract the email from the token using `extractEmail(token)`.
    2. Return `true` if the extracted email equals `userDetails.getUsername()` AND the token is not expired (call a private helper `isTokenExpired(token)`).
  - **Private Helper Methods:**
    - `private Key getSigningKey()`: Decodes the `secretKey` (which should be Base64 encoded) and returns a `Key` object.
    - `private Claims extractAllClaims(String token)`: Parses the token using the signing key and returns the `Claims` body.
    - `private <T> T extractClaim(String token, Function<Claims, T> claimsResolver)`: A generic method to extract a specific claim.
    - `private boolean isTokenExpired(String token)`: Extracts the expiration date from the token and checks if it is before the current date.
    - `public Date extractExpiration(String token)`: Extracts and returns the expiration `Date` from the token's claims. This will be used by `AuthController`.

### Controller Layer

**1. `AuthController.java`**
This controller exposes the login endpoint.
- **Annotations:** `@RestController`, `@RequestMapping("/api/v1/auth")`.
- **Dependencies:** Inject `AuthenticationManager`, `UserService`, and `JwtUtil`.
- **API Endpoint:**
  - `POST /login`: `public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthRequest authRequest)`
    1. Use a `try-catch` block to handle `BadCredentialsException`.
    2. Inside the `try` block, call `authenticationManager.authenticate()` with a new `UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())`.
    3. If authentication succeeds, load the `UserDetails` by calling `userService.loadUserByUsername(authRequest.getEmail())`.
    4. Generate a JWT by calling `jwtUtil.generateToken(userDetails)`.
    5. Extract the role from `userDetails.getAuthorities().iterator().next().getAuthority()`.
    6. Get the token expiration timestamp by calling `jwtUtil.extractExpiration(token).getTime()`.
    7. Create a new `AuthResponse` with the token, role, and expiration timestamp.
    8. Return `ResponseEntity.ok(authResponse)`.
    9. In the `catch` block for `BadCredentialsException`, return `ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null)`.

### Security Configuration

**1. `JwtAuthFilter.java`**
This filter intercepts every request to validate the JWT.
- **Annotations:** `@Component`.
- **Inheritance:** Extends `OncePerRequestFilter`.
- **Dependencies:** Inject `JwtUtil` and `UserService`.
- **Methods:**
  - `protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)`:
    1. Get the `Authorization` header from the `request`.
    2. If the header is `null` or does not start with "Bearer ", call `filterChain.doFilter(request, response)` and return.
    3. Extract the JWT from the header (substring after "Bearer ").
    4. Extract the user email from the token using `jwtUtil.extractEmail(jwt)`.
    5. If the email is not `null` and `SecurityContextHolder.getContext().getAuthentication()` is `null`:
       a. Load `UserDetails` using `userService.loadUserByUsername(email)`.
       b. Validate the token using `jwtUtil.validateToken(jwt, userDetails)`.
       c. If the token is valid, create a `UsernamePasswordAuthenticationToken` with `userDetails`, `null` credentials, and `userDetails.getAuthorities()`.
       d. Set details on the token: `token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request))`.
       e. Set the authentication in the security context: `SecurityContextHolder.getContext().setAuthentication(token)`.
    6. Call `filterChain.doFilter(request, response)` to continue the filter chain.

**2. `SecurityConfig.java`**
This class configures Spring Security.
- **Annotations:** `@Configuration`, `@EnableWebSecurity`.
- **Dependencies:** Inject `JwtAuthFilter` and `UserService`.
- **Bean Definitions:**
  - `@Bean public SecurityFilterChain securityFilterChain(HttpSecurity http)`:
    1. Disable CSRF: `http.csrf(AbstractHttpConfigurer::disable)`.
    2. Configure CORS (a basic `CorsConfigurationSource` bean allowing common methods and headers from your frontend origin should be defined).
    3. Configure authorization rules: `http.authorizeHttpRequests(auth -> auth...`
       - Permit all requests to `/api/v1/auth/**`, `/api/v1/menu/**`, and `/api/v1/reservations`.
       - Require `ADMIN` role for `/api/v1/admin/**` using `.hasAuthority("ADMIN")`.
       - All other requests must be authenticated: `.anyRequest().authenticated()`.
    4. Configure session management to be stateless: `sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`.
    5. Set the custom authentication provider: `.authenticationProvider(authenticationProvider())`.
    6. Add the `jwtAuthFilter` before the standard username/password filter: `addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`.
    7. Build and return the `SecurityFilterChain`.
  - `@Bean public AuthenticationProvider authenticationProvider()`: Creates and returns a `DaoAuthenticationProvider`, setting the `userDetailsService` (your `UserService` bean) and `passwordEncoder()` on it.
  - `@Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration config)`: Returns the `AuthenticationManager` from the provided configuration.
  - `@Bean public PasswordEncoder passwordEncoder()`: Returns a new `BCryptPasswordEncoder`.

**3. `AdminInitializer.java`**
This component creates a default admin user on application startup if one doesn't exist.
- **Annotations:** `@Component`.
- **Implementation:** Implements `CommandLineRunner`.
- **Dependencies:** Inject `UserRepository` and `PasswordEncoder`.
- **Configuration Properties:** Inject admin details from `application.properties`:
  - `@Value("${admin.email}") private String adminEmail;`
  - `@Value("${admin.password}") private String adminPassword;`
  - `@Value("${admin.name}") private String adminName;`
- **Methods:**
  - `public void run(String... args)`:
    1. Check if an admin user already exists by calling `userRepository.findByEmail(adminEmail)`.
    2. If the returned `Optional` is empty:
       a. Create a new `User` object.
       b. Set its email, name, and role (`Role.ADMIN`).
       c. Set its password by encoding `adminPassword` with the injected `passwordEncoder`.
       d. Save the new user using `userRepository.save(adminUser)`.
       e. Log an informational message that the admin user has been created.

---

## Menu Management (Backend)

**Name:** `menu-management-backend`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/waydownsouth/model/MenuItem.java` — MODEL layer — defines the MenuItem entity for JPA, including its properties (name, price, etc.) and its many-to-one relationship with MenuItemCategory.
- `backend/src/main/java/com/waydownsouth/model/MenuItemCategory.java` — MODEL layer — defines the MenuItemCategory entity, establishing the one-to-many relationship back to MenuItem entities for grouping.
- `backend/src/main/java/com/waydownsouth/repository/MenuItemRepository.java` — REPOSITORY layer — provides data access methods for MenuItem entities, including custom queries like findByCategoryName(String) used by MenuService to filter the menu.
- `backend/src/main/java/com/waydownsouth/repository/MenuItemCategoryRepository.java` — REPOSITORY layer — provides standard CRUD data access methods for MenuItemCategory entities, used by MenuService and AdminMenuController.
- `backend/src/main/java/com/waydownsouth/dto/MenuItemDto.java` — DTO layer — defines the public contract for menu items in the API. It is used for both request bodies in admin operations and response bodies in public and admin endpoints.
- `backend/src/main/java/com/waydownsouth/service/MenuService.java` — SERVICE layer — implements business logic for menu management. It provides methods like getAllMenuItems(String, String) for public controllers and CRUD operations like createMenuItem(MenuItemDto) for admin controllers, delegating persistence to repositories.
- `backend/src/main/java/com/waydownsouth/controller/MenuController.java` — CONTROLLER layer — exposes public, read-only endpoints for the menu. It exposes GET /api/v1/menu/items and GET /api/v1/menu/categories, delegating all business logic to the MenuService.
- `backend/src/main/java/com/waydownsouth/controller/AdminMenuController.java` — CONTROLLER layer — provides secure, admin-only CRUD endpoints under /api/v1/admin/menu-items. All methods are protected by @PreAuthorize("hasRole('ADMIN')") and delegate actions to the MenuService.

**Feature Instruction:**

This feature implements the backend for menu management at Way Down South. It provides public, read-only endpoints for customers to view the menu and secured endpoints for administrators to perform CRUD operations on menu items and categories.

### 1. Data Models

**`MenuItemCategory.java`**
- Annotate as a JPA `@Entity`.
- `id`: `UUID`, the primary key. Use `@Id` and `@GeneratedValue(strategy = GenerationType.UUID)`.
- `name`: `String`, not null, unique, max 50 characters. Use `@Column(nullable = false, unique = true, length = 50)`.
- `menuItems`: `List<MenuItem>`, representing the one-to-many relationship. Use `@OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)`. `mappedBy` should point to the `category` field in `MenuItem`.

**`MenuItem.java`**
- Annotate as a JPA `@Entity`.
- `id`: `UUID`, the primary key. Use `@Id` and `@GeneratedValue(strategy = GenerationType.UUID)`.
- `name`: `String`, not null, max 100 characters. Use `@Column(nullable = false, length = 100)`.
- `description`: `String`, max 255 characters. Use `@Column(length = 255)`.
- `price`: `BigDecimal`, not null. Use `@Column(nullable = false, precision = 10, scale = 2)`.
- `imageUrl`: `String`.
- `isAvailable`: `boolean`.
- `category`: `MenuItemCategory`, representing the many-to-one relationship. Use `@ManyToOne(fetch = FetchType.LAZY)` and `@JoinColumn(name = "category_id", nullable = false)`.

### 2. Data Transfer Object (DTO)

**`MenuItemDto.java`**
- This is a standard POJO class for API communication.
- `id`: `UUID`.
- `name`: `String`. Add `@NotBlank` validation.
- `description`: `String`.
- `price`: `BigDecimal`. Add `@NotNull` and `@Positive` validation.
- `imageUrl`: `String`.
- `isAvailable`: `boolean`.
- `categoryName`: `String`. Add `@NotBlank` validation.

### 3. Repositories

**`MenuItemCategoryRepository.java`**
- This interface should extend `JpaRepository<MenuItemCategory, UUID>`.
- Add the method `Optional<MenuItemCategory> findByName(String name);` which will be used by `MenuService` to find existing categories.

**`MenuItemRepository.java`**
- This interface should extend `JpaRepository<MenuItem, UUID>`.
- Implement the following custom query methods:
  - `List<MenuItem> findByCategoryName(String categoryName);`
  - `List<MenuItem> findByNameContainingIgnoreCase(String name);`

### 4. Service Layer

**`MenuService.java`**
- Annotate with `@Service`.
- Inject `MenuItemRepository` and `MenuItemCategoryRepository` via constructor injection.
- Implement a private helper method `private MenuItemDto mapToDto(MenuItem item)` to convert a `MenuItem` entity to a `MenuItemDto`. The `categoryName` in the DTO should be populated from `item.getCategory().getName()`.
- Implement another private helper method `private void mapDtoToEntity(MenuItemDto dto, MenuItem entity, MenuItemCategory category)` to update an entity from a DTO.

**Public Methods:**

- **`List<MenuItemDto> getAllMenuItems(String category, String searchTerm)`**
  1. Initialize an empty `List<MenuItem>` called `menuItems`.
  2. If `category` is not null or blank, call `menuItemRepository.findByCategoryName(category)` and assign the result to `menuItems`.
  3. Else if `searchTerm` is not null or blank, call `menuItemRepository.findByNameContainingIgnoreCase(searchTerm)` and assign the result to `menuItems`.
  4. Otherwise, call `menuItemRepository.findAll()` and assign the result to `menuItems`.
  5. Stream the `menuItems` list, map each `MenuItem` to a `MenuItemDto` using `mapToDto`, and return the resulting list.

- **`List<String> getAllCategories()`**
  1. Call `menuItemCategoryRepository.findAll()`.
  2. Stream the result, map each `MenuItemCategory` to its `name` property (`MenuItemCategory::getName`).
  3. Collect the results into a `List<String>` and return it.

- **`MenuItemDto createMenuItem(MenuItemDto menuItemDto)`**
  1. Use `menuItemCategoryRepository.findByName(menuItemDto.getCategoryName())` to find the category. 
  2. If the category is not found, create a new `MenuItemCategory` instance, set its name from `menuItemDto.getCategoryName()`, and save it using `menuItemCategoryRepository.save()`.
  3. Create a new `MenuItem` entity.
  4. Use the helper method `mapDtoToEntity` to populate the new `MenuItem` from `menuItemDto`, passing the found or newly created category.
  5. Save the new `MenuItem` using `menuItemRepository.save()`.
  6. Return the result of mapping the saved entity back to a `MenuItemDto`.

- **`MenuItemDto updateMenuItem(UUID id, MenuItemDto menuItemDto)`**
  1. Find the existing `MenuItem` by its `id` using `menuItemRepository.findById(id)`. If not found, throw a `ResourceNotFoundException` (from the `com.waydownsouth.exception` package).
  2. Find or create the `MenuItemCategory` using the same logic as in `createMenuItem`.
  3. Use the `mapDtoToEntity` helper to update the found `MenuItem` entity's fields from `menuItemDto` and set its category.
  4. Save the updated `MenuItem` entity.
  5. Return the result of mapping the saved entity to a `MenuItemDto`.

- **`void deleteMenuItem(UUID id)`**
  1. Check if the menu item exists using `menuItemRepository.existsById(id)`. If it does not exist, throw a `ResourceNotFoundException`.
  2. If it exists, call `menuItemRepository.deleteById(id)`.

### 5. Controller Layer

**`MenuController.java` (Public API)**
- Annotate with `@RestController` and `@RequestMapping("/api/v1/menu")`.
- Inject `MenuService`.

- **`ResponseEntity<List<MenuItemDto>> getMenuItems(@RequestParam(required = false) String category, @RequestParam(required = false) String search)`**
  1. Annotate with `@GetMapping("/items")`.
  2. Call `menuService.getAllMenuItems(category, search)`.
  3. Return the result wrapped in `ResponseEntity.ok()`.

- **`ResponseEntity<List<String>> getMenuCategories()`**
  1. Annotate with `@GetMapping("/categories")`.
  2. Call `menuService.getAllCategories()`.
  3. Return the result wrapped in `ResponseEntity.ok()`.

**`AdminMenuController.java` (Admin API)**
- Annotate with `@RestController` and `@RequestMapping("/api/v1/admin/menu-items")`.
- Secure the entire class with `@PreAuthorize("hasRole('ADMIN')")`. This relies on Spring Security configured in the `authentication-backend` feature.
- Inject `MenuService`.

- **`ResponseEntity<MenuItemDto> createMenuItem(@Valid @RequestBody MenuItemDto menuItemDto)`**
  1. Annotate with `@PostMapping`.
  2. Call `menuService.createMenuItem(menuItemDto)`.
  3. Return the created `MenuItemDto` with an HTTP 201 Created status: `return new ResponseEntity<>(createdItem, HttpStatus.CREATED);`.

- **`ResponseEntity<MenuItemDto> updateMenuItem(@PathVariable UUID id, @Valid @RequestBody MenuItemDto menuItemDto)`**
  1. Annotate with `@PutMapping("/{id}")`.
  2. Call `menuService.updateMenuItem(id, menuItemDto)`.
  3. Return the updated `MenuItemDto` wrapped in `ResponseEntity.ok()`.
  4. Note: If `menuService` throws `ResourceNotFoundException`, the `GlobalExceptionHandler` will automatically handle it and return a 404 Not Found response.

- **`ResponseEntity<Void> deleteMenuItem(@PathVariable UUID id)`**
  1. Annotate with `@DeleteMapping("/{id}")`.
  2. Call `menuService.deleteMenuItem(id)`.
  3. Return an empty response with HTTP 204 No Content: `return ResponseEntity.noContent().build();`.
  4. Note: If `menuService` throws `ResourceNotFoundException`, the `GlobalExceptionHandler` will handle it and return a 404 response.

---

## Reservation System (Backend)

**Name:** `reservation-system-backend`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/waydownsouth/model/Reservation.java` — MODEL layer — defines the Reservation entity for JPA persistence, capturing all necessary details for a table booking, including customer info, time, and status.
- `backend/src/main/java/com/waydownsouth/model/ReservationStatus.java` — MODEL layer — defines the ReservationStatus enumeration (PENDING, CONFIRMED, CANCELLED, COMPLETED) to manage the lifecycle of a Reservation entity.
- `backend/src/main/java/com/waydownsouth/repository/ReservationRepository.java` — REPOSITORY layer — provides data access methods for Reservation entities, including a custom query findByReservationTimeBetween to fetch reservations for a specific day or week for the admin dashboard.
- `backend/src/main/java/com/waydownsouth/dto/CreateReservationRequest.java` — DTO layer — defines the request body for creating a new reservation, including validation annotations to ensure data integrity before it reaches the service layer.
- `backend/src/main/java/com/waydownsouth/dto/ReservationResponse.java` — DTO layer — defines the JSON response for reservation-related endpoints, providing a client-friendly representation of a reservation.
- `backend/src/main/java/com/waydownsouth/dto/UpdateReservationStatusRequest.java` — DTO layer — defines the simple request body for admin endpoints that update a reservation's status, containing only the new status string.
- `backend/src/main/java/com/waydownsouth/service/ReservationService.java` — SERVICE layer — implements business logic for reservations. It provides createReservation(CreateReservationRequest) for the public controller and methods like getAllReservations() and updateReservationStatus(UUID, ReservationStatus) for the admin controller.
- `backend/src/main/java/com/waydownsouth/controller/ReservationController.java` — CONTROLLER layer — exposes the public POST /api/v1/reservations endpoint for customers to submit booking requests, delegating creation logic to the ReservationService.
- `backend/src/main/java/com/waydownsouth/controller/AdminReservationController.java` — CONTROLLER layer — provides secure, admin-only endpoints under /api/v1/admin/reservations. It exposes GET to list all reservations and PUT to update their status, protected by @PreAuthorize("hasRole('ADMIN')").

**Feature Instruction:**

This feature implements the backend for Way Down South's table reservation system. It includes a public endpoint for customers to create reservations and a set of admin-only endpoints to view and manage them.

### 1. Model Layer

**`ReservationStatus.java`**
- This is an enumeration representing the lifecycle of a reservation.
- Location: `com.waydownsouth.model`
- Define the enum with the following values: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`.

**`Reservation.java`**
- This is the JPA entity for a reservation.
- Location: `com.waydownsouth.model`
- Annotate with `@Entity` and `@Table(name = "reservations")`.
- It must contain the following fields:
  - `id`: `UUID`. The primary key. Annotate with `@Id` and `@GeneratedValue(strategy = GenerationType.AUTO)`.
  - `customerName`: `String`. Annotate with `@Column(nullable = false)`.
  - `customerPhone`: `String`. Annotate with `@Column(nullable = false)`.
  - `customerEmail`: `String`.
  - `reservationTime`: `LocalDateTime`. Annotate with `@Column(nullable = false)`.
  - `partySize`: `int`. Annotate with `@Column(nullable = false)`.
  - `status`: `ReservationStatus`. Annotate with `@Column(nullable = false)` and `@Enumerated(EnumType.STRING)` to store the enum's name as a string in the database.
  - `specialRequests`: `String`.
- Include standard getters, setters, and a no-args constructor.

### 2. Repository Layer

**`ReservationRepository.java`**
- This is the Spring Data JPA repository for the `Reservation` entity.
- Location: `com.waydownsouth.repository`
- It must be an interface that extends `JpaRepository<Reservation, UUID>`.
- Define the following custom query method:
  - `List<Reservation> findByReservationTimeBetween(LocalDateTime start, LocalDateTime end);`

### 3. DTO Layer

**`CreateReservationRequest.java`**
- A DTO for the public reservation creation endpoint.
- Location: `com.waydownsouth.dto`
- Fields with Jakarta validation annotations:
  - `customerName`: `String`, with `@NotBlank`.
  - `customerPhone`: `String`, with `@NotBlank`.
  - `customerEmail`: `String`, with `@Email`.
  - `reservationTime`: `LocalDateTime`, with `@NotNull` and `@Future`.
  - `partySize`: `int`, with `@NotNull` and `@Min(1)`.
  - `specialRequests`: `String` (optional, no validation needed).

**`ReservationResponse.java`**
- A DTO for returning reservation details to clients.
- Location: `com.waydownsouth.dto`
- Fields:
  - `id`: `UUID`
  - `customerName`: `String`
  - `reservationTime`: `LocalDateTime`
  - `partySize`: `int`
  - `status`: `String`

**`UpdateReservationStatusRequest.java`**
- A DTO for the admin endpoint to update a reservation's status.
- Location: `com.waydownsouth.dto`
- Fields with Jakarta validation annotations:
  - `status`: `String`, with `@NotBlank`.

### 4. Service Layer

**`ReservationService.java`**
- This service contains the business logic for reservations.
- Location: `com.waydownsouth.service`
- Annotate with `@Service`.
- Inject `ReservationRepository` via constructor injection.
- Implement the following public methods:

  **`ReservationResponse createReservation(CreateReservationRequest request)`**
  1. Create a new `Reservation` entity instance.
  2. Map all fields from the `request` DTO to the new entity.
  3. Set the `status` of the new entity to `ReservationStatus.PENDING`.
  4. Save the entity using `reservationRepository.save()`.
  5. Map the saved `Reservation` entity to a `ReservationResponse` DTO.
  6. Return the `ReservationResponse` DTO.

  **`List<ReservationResponse> getAllReservations()`**
  1. Fetch all `Reservation` entities using `reservationRepository.findAll()`.
  2. Use a stream to map each `Reservation` entity to a `ReservationResponse` DTO.
  3. Collect the results into a `List` and return it.

  **`ReservationResponse updateReservationStatus(UUID id, ReservationStatus status)`**
  1. Find the reservation using `reservationRepository.findById(id)`.
  2. If the reservation is not found, throw a `ResourceNotFoundException` with the message "Reservation not found with id: " + id.
  3. Get the `Reservation` entity from the `Optional`.
  4. Set the entity's status to the provided `status` parameter.
  5. Save the updated entity using `reservationRepository.save()`.
  6. Map the updated `Reservation` entity to a `ReservationResponse` DTO and return it.

- It is recommended to create a private helper method `private ReservationResponse mapToResponse(Reservation reservation)` to handle the mapping from the entity to the response DTO, converting the `ReservationStatus` enum to a `String` via `name()`.

### 5. Controller Layer

**`ReservationController.java` (Public)**
- Exposes the public endpoint for creating reservations.
- Location: `com.waydownsouth.controller`
- Annotate the class with `@RestController` and `@RequestMapping("/api/v1/reservations")`.
- Inject `ReservationService` via constructor injection.
- Implement the following method:

  **`ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody CreateReservationRequest request)`**
  - Annotate with `@PostMapping`.
  - The `@Valid` annotation is crucial for triggering DTO validation.
  - Logic:
    1. Call `reservationService.createReservation(request)`.
    2. Wrap the returned `ReservationResponse` in a `ResponseEntity` with HTTP status `201 CREATED`.

**`AdminReservationController.java` (Admin)**
- Exposes admin-only endpoints for managing reservations.
- Location: `com.waydownsouth.controller`
- Annotate the class with `@RestController`, `@RequestMapping("/api/v1/admin/reservations")`, and `@PreAuthorize("hasRole('ADMIN')")` to secure all endpoints within it.
- Inject `ReservationService` via constructor injection.
- Implement the following methods:

  **`ResponseEntity<List<ReservationResponse>> getAllReservations()`**
  - Annotate with `@GetMapping`.
  - Logic:
    1. Call `reservationService.getAllReservations()`.
    2. Wrap the returned list in a `ResponseEntity` with HTTP status `200 OK`.

  **`ResponseEntity<ReservationResponse> updateReservationStatus(@PathVariable UUID id, @Valid @RequestBody UpdateReservationStatusRequest request)`**
  - Annotate with `@PutMapping("/{id}/status")`.
  - Logic:
    1. Declare a `ReservationStatus newStatus;` variable.
    2. Use a `try-catch` block to parse the status string from the request: `newStatus = ReservationStatus.valueOf(request.getStatus().toUpperCase());`.
    3. In the `catch` block (for `IllegalArgumentException`), return `ResponseEntity.badRequest().build()` to indicate an invalid status string was provided.
    4. If parsing succeeds, call `reservationService.updateReservationStatus(id, newStatus)`.
    5. Wrap the returned `ReservationResponse` in a `ResponseEntity` with HTTP status `200 OK`.

### 6. Integration and Error Handling
- The controllers delegate all business logic to the `ReservationService`.
- The `ReservationService` uses the `ReservationRepository` for data persistence.
- DTOs are used as the data contract for the API endpoints.
- Validation errors on request DTOs will be automatically handled by Spring, resulting in a 400 Bad Request response, thanks to the `GlobalExceptionHandler` in the `shared-models-repos` feature.
- The `ResourceNotFoundException` thrown by the service will be caught by the `GlobalExceptionHandler` and converted into a 404 Not Found response.
- The `@PreAuthorize` annotation on `AdminReservationController` relies on the security configuration provided by the `authentication-backend` feature to restrict access to users with the 'ADMIN' role.

---

## Order Processing Core (Backend)

**Name:** `order-core-backend`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/waydownsouth/model/Order.java` — MODEL layer — defines the Order entity for JPA persistence. It holds customer details, total amount, status, and payment-related IDs, and has a one-to-many relationship with OrderItem.
- `backend/src/main/java/com/waydownsouth/model/OrderItem.java` — MODEL layer — defines the OrderItem entity, representing a single product within an Order. It captures the specific menu item, quantity, and price at the time of purchase and has a many-to-one relationship back to the Order.
- `backend/src/main/java/com/waydownsouth/model/OrderStatus.java` — MODEL layer — defines the OrderStatus enumeration to manage the lifecycle of an Order entity, from PENDING_PAYMENT through to DELIVERED or CANCELLED.
- `backend/src/main/java/com/waydownsouth/repository/OrderRepository.java` — REPOSITORY layer — provides data access for Order entities. Includes the critical findByRazorpayOrderId(String) method used by the payment webhook to locate and update the correct order.
- `backend/src/main/java/com/waydownsouth/repository/OrderItemRepository.java` — REPOSITORY layer — provides standard CRUD data access methods for OrderItem entities, used primarily by the OrderService when creating and persisting new orders.
- `backend/src/main/java/com/waydownsouth/service/OrderService.java` — SERVICE layer — orchestrates the entire order process. Its initiateOrder method calculates totals and calls PaymentService.createRazorpayOrder(), while verifyPaymentAndUpdateOrder is called by the webhook controller to confirm payment and update the order status.

**Feature Instruction:**

This feature implements the core business logic for order processing at Way Down South. It defines the data models for orders and their items, the repositories for database interaction, and the service layer that orchestrates order creation, payment integration with Razorpay, and status management.

### Data Models (`com.waydownsouth.model`)

**1. `OrderStatus.java`**
This is a public enum defining the possible states of an order.
- **Enum Constants**: `PENDING_PAYMENT`, `RECEIVED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

**2. `OrderItem.java`**
This class is a JPA entity representing a single item within an order.
- **Annotations**: `@Entity`, `@Table(name = "order_items")`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- **Fields**:
  - `id` (UUID): The primary key. Annotate with `@Id` and `@GeneratedValue(strategy = GenerationType.UUID)`.
  - `order` (Order): A many-to-one relationship to the parent `Order`. Annotate with `@ManyToOne(fetch = FetchType.LAZY)`, `@JoinColumn(name = "order_id", nullable = false)`, and `@JsonBackReference` to prevent serialization loops.
  - `menuItemId` (UUID): The ID of the menu item. Annotate with `@NotNull`.
  - `menuItemName` (String): The name of the menu item, denormalized for historical accuracy. Annotate with `@NotNull`.
  - `quantity` (int): The quantity ordered. Annotate with `@NotNull`.
  - `pricePerItem` (BigDecimal): The price of a single unit at the time of order. Annotate with `@NotNull` and `@Column(precision = 10, scale = 2)`.

**3. `Order.java`**
This is the main JPA entity for a customer's order.
- **Annotations**: `@Entity`, `@Table(name = "orders")`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- **Fields**:
  - `id` (UUID): The primary key. Annotate with `@Id` and `@GeneratedValue(strategy = GenerationType.UUID)`.
  - `customerName` (String): Annotate with `@NotNull`.
  - `customerPhone` (String): Annotate with `@NotNull`.
  - `deliveryAddress` (String): Annotate with `@NotNull`.
  - `totalAmount` (BigDecimal): Annotate with `@NotNull` and `@Column(precision = 10, scale = 2)`.
  - `status` (OrderStatus): Annotate with `@NotNull` and `@Enumerated(EnumType.STRING)`.
  - `orderTimestamp` (LocalDateTime): Automatically set on creation. Annotate with `@CreationTimestamp`.
  - `items` (List<OrderItem>): A one-to-many relationship to the order's items. Annotate with `@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)` and `@JsonManagedReference`.
  - `razorpayOrderId` (String): The order ID from Razorpay. Can be null initially.
  - `razorpayPaymentId` (String): The payment ID from Razorpay. Can be null initially.

### Repositories (`com.waydownsouth.repository`)

**1. `OrderItemRepository.java`**
- **Definition**: A public interface that extends `JpaRepository<OrderItem, UUID>`. Annotate with `@Repository`. No custom methods are needed.

**2. `OrderRepository.java`**
- **Definition**: A public interface that extends `JpaRepository<Order, UUID>`. Annotate with `@Repository`.
- **Custom Method**:
  - `Optional<Order> findByRazorpayOrderId(String razorpayOrderId)`: This method is crucial for retrieving an order during the payment webhook verification process.

### Service Layer (`com.waydownsouth.service`)

**`OrderService.java`**
This service contains all business logic for managing orders. Annotate with `@Service` and use constructor injection for its dependencies.

- **Dependencies**:
  - `OrderRepository orderRepository`
  - `MenuItemRepository menuItemRepository` (from `menu-management-backend` feature)
  - `PaymentService paymentService` (from `payment-gateway-backend` feature)

- **Public Methods**:

  **1. `RazorpayOrderResponse initiateOrder(CreateOrderRequest request)`**
  This method creates a new order in a `PENDING_PAYMENT` state and generates a corresponding order on Razorpay.
  - **Logic**:
    1.  Initialize a `BigDecimal totalAmount` to zero.
    2.  Create a new `Order` instance and populate `customerName`, `customerPhone`, and `deliveryAddress` from the `request`.
    3.  Create an empty `ArrayList` for `OrderItem`s.
    4.  Iterate through each item DTO in `request.getItems()`:
        a. Fetch the corresponding `MenuItem` from `menuItemRepository.findById(itemDto.getMenuItemId())`. 
        b. **Error Case**: If a `MenuItem` is not found, throw a `ResourceNotFoundException` with the message "Menu item not found with id: [id]".
        c. Create a new `OrderItem` instance.
        d. Set its `order` to the `Order` instance from step 2.
        e. Populate `menuItemId`, `menuItemName`, `quantity`, and `pricePerItem` from the fetched `MenuItem` and the item DTO.
        f. Add the new `OrderItem` to the list created in step 3.
        g. Calculate the subtotal for this item (`pricePerItem` * `quantity`) and add it to `totalAmount`.
    5.  Set the final `totalAmount` and the `items` list on the `Order` instance.
    6.  Set the order `status` to `OrderStatus.PENDING_PAYMENT`.
    7.  Call `paymentService.createRazorpayOrder(totalAmount, "INR")` to get the Razorpay order ID. This method is from the `payment-gateway-backend` feature.
    8.  Set the returned `razorpayOrderId` on the `Order` instance.
    9.  Save the `Order` entity using `orderRepository.save(order)`. This will cascade-save the associated `OrderItem`s.
    10. Create and return a `RazorpayOrderResponse` containing the `razorpayOrderId` and `totalAmount`.

  **2. `OrderResponse verifyPaymentAndUpdateOrder(PaymentVerificationRequest request)`**
  This method is called by the payment webhook to verify the payment signature and update the order status.
  - **Logic**:
    1.  Call `paymentService.verifyPaymentSignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature())`. This method is from the `payment-gateway-backend` feature.
    2.  **Error Case**: If verification fails (returns `false`), throw a custom `PaymentVerificationException` with the message "Invalid Razorpay signature.", which should result in a 400 Bad Request.
    3.  If verification succeeds, find the order using `orderRepository.findByRazorpayOrderId(request.getRazorpayOrderId())`.
    4.  **Error Case**: If the order is not found, throw a `ResourceNotFoundException` with the message "Order not found with Razorpay order ID: [id]".
    5.  Update the found `Order`'s status to `OrderStatus.RECEIVED`.
    6.  Set the `razorpayPaymentId` on the `Order` from the `request`.
    7.  Save the updated order using `orderRepository.save(order)`.
    8.  Map the updated `Order` entity to an `OrderResponse` DTO and return it.

  **3. `List<OrderResponse> getAllOrdersForAdmin()`**
  Retrieves all orders for display on the admin dashboard.
  - **Logic**:
    1.  Fetch all `Order` entities using `orderRepository.findAll(Sort.by(Sort.Direction.DESC, "orderTimestamp"))`.
    2.  Map each `Order` entity to an `OrderResponse` DTO.
    3.  Return the list of `OrderResponse` DTOs.

  **4. `OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus)`**
  Allows an admin to manually update the status of an order.
  - **Logic**:
    1.  Find the order using `orderRepository.findById(orderId)`.
    2.  **Error Case**: If the order is not found, throw a `ResourceNotFoundException` with the message "Order not found with id: [id]".
    3.  Set the order's `status` to `newStatus`.
    4.  Save the updated order using `orderRepository.save(order)`.
    5.  Map the updated `Order` entity to an `OrderResponse` DTO and return it.

---

## Order Processing API (Backend)

**Name:** `order-api-backend`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/waydownsouth/dto/CreateOrderRequest.java` — DTO layer — defines the request body for initiating an order. It contains customer details and a list of OrderItemRequest objects, with validation to ensure all required fields are present.
- `backend/src/main/java/com/waydownsouth/dto/OrderItemRequest.java` — DTO layer — defines the structure for an individual item within a CreateOrderRequest, specifying the menu item's ID and the desired quantity.
- `backend/src/main/java/com/waydownsouth/dto/OrderResponse.java` — DTO layer — defines the JSON response for order-related endpoints, providing a client-friendly summary of an order's state and key details.
- `backend/src/main/java/com/waydownsouth/controller/OrderController.java` — CONTROLLER layer — exposes the public POST /api/v1/orders endpoint. It receives the customer's cart and details, and calls OrderService.initiateOrder() to create a Razorpay order.
- `backend/src/main/java/com/waydownsouth/controller/AdminOrderController.java` — CONTROLLER layer — provides secure, admin-only endpoints under /api/v1/admin/orders. It exposes GET to list all orders and PUT to update their status, protected by @PreAuthorize("hasRole('ADMIN')").

**Feature Instruction:**

This feature instruction outlines the implementation of the Order Processing API, which exposes endpoints for both public order creation and admin-level order management. The feature consists of DTOs for request/response bodies and two controllers that act as the API layer, delegating business logic to the `OrderService` from the `order-core-backend` feature.

### 1. Data Transfer Objects (DTOs)

These are simple POJOs used for API communication. Ensure all specified validation annotations are included.

**`OrderItemRequest.java`**
- A class representing a single item in an order.
- **Fields:**
  - `UUID menuItemId`: Annotated with `@NotNull`.
  - `int quantity`: Annotated with `@Min(1)`.

**`CreateOrderRequest.java`**
- A class for the public order creation request body.
- **Fields:**
  - `String customerName`: Annotated with `@NotBlank`.
  - `String customerPhone`: Annotated with `@NotBlank`.
  - `String deliveryAddress`: Annotated with `@NotBlank`.
  - `List<OrderItemRequest> items`: Annotated with `@NotEmpty`.

**`OrderResponse.java`**
- A class for returning order details in API responses.
- **Fields:**
  - `UUID id`: The unique identifier of the order.
  - `BigDecimal totalAmount`: The total calculated cost of the order.
  - `String status`: The current status of the order (e.g., "PENDING", "CONFIRMED").
  - `LocalDateTime orderTimestamp`: The timestamp when the order was created.

### 2. Public Order Controller

**`OrderController.java`**
- This controller handles public-facing order creation.
- **Class Annotations:** `@RestController`, `@RequestMapping("/api/v1/orders")`.
- **Dependencies:**
  - Inject `OrderService` from the `order-core-backend` feature using constructor injection.

- **Public Method:**
  - `public ResponseEntity<RazorpayOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request)`
    - **Annotation:** `@PostMapping`.
    - **Endpoint:** `POST /api/v1/orders`.
    - **Logic:**
      1. Delegate the entire process to the injected `OrderService`.
      2. Call `orderService.initiateOrder(request)`. This method, from the `order-core-backend` feature, will handle order creation, calculate the total, and create a Razorpay order.
      3. The `initiateOrder` method returns a `RazorpayOrderResponse` object.
      4. Return the result wrapped in a `ResponseEntity.ok()`.
    - **Error Handling:** Validation errors on `CreateOrderRequest` will be automatically handled by Spring's validation framework, returning a 400 Bad Request response (as configured in `GlobalExceptionHandler`).

### 3. Admin Order Controller

**`AdminOrderController.java`**
- This controller provides secure endpoints for administrators to manage orders.
- **Class Annotations:** `@RestController`, `@RequestMapping("/api/v1/admin/orders")`, `@PreAuthorize("hasRole('ADMIN')")` to ensure only users with the 'ADMIN' role can access these endpoints.
- **Dependencies:**
  - Inject `OrderService` from the `order-core-backend` feature using constructor injection.

- **Public Methods:**

  - `public ResponseEntity<List<OrderResponse>> getAllOrders()`
    - **Annotation:** `@GetMapping`.
    - **Endpoint:** `GET /api/v1/admin/orders`.
    - **Logic:**
      1. Call `orderService.getAllOrdersForAdmin()`.
      2. Return the resulting `List<OrderResponse>` wrapped in `ResponseEntity.ok()`.

  - `public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable UUID id, @RequestBody Map<String, String> statusMap)`
    - **Annotation:** `@PutMapping("/{id}/status")`.
    - **Endpoint:** `PUT /api/v1/admin/orders/{id}/status`.
    - **Request Body:** A JSON object like `{ "status": "PREPARING" }`.
    - **Logic:**
      1. Extract the status string from the `statusMap` using the key "status".
      2. If the status string is null or blank, throw an `IllegalArgumentException` with a descriptive message. This will result in a 400 Bad Request.
      3. Convert the status string to the `OrderStatus` enum. This enum is part of the `order-core-backend` feature. Use `OrderStatus.valueOf(statusString.trim().toUpperCase())`.
      4. Wrap the conversion in a `try-catch` block. If an `IllegalArgumentException` occurs (due to an invalid status string), return a `ResponseEntity.badRequest()` with an informative error message.
      5. Call `orderService.updateOrderStatus(id, newStatusEnum)` where `newStatusEnum` is the converted enum value.
      6. Return the `OrderResponse` from the service call wrapped in `ResponseEntity.ok()`.
    - **Error Handling:**
      - If the order with the given `id` is not found, the `OrderService` is expected to throw a `ResourceNotFoundException`, which will be handled by the `GlobalExceptionHandler` to return a 404 Not Found.
      - Invalid status values in the request body will result in a 400 Bad Request as described above.

### 4. Cross-Feature Interactions

- **`OrderController` and `AdminOrderController`** both depend on and inject **`OrderService`** from the `order-core-backend` feature.
- The following methods from `OrderService` are consumed:
  - `RazorpayOrderResponse initiateOrder(CreateOrderRequest request)`
  - `List<OrderResponse> getAllOrdersForAdmin()`
  - `OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus)`
- The controllers act as a thin API gateway, forwarding requests to the service layer where the core business logic resides. Security is enforced at the controller layer using Spring Security's method-level annotations (`@PreAuthorize`).

---

## Payment Gateway Integration (Backend)

**Name:** `payment-gateway-backend`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/waydownsouth/service/PaymentService.java` — SERVICE layer — encapsulates all interactions with the Razorpay API. It provides createRazorpayOrder(BigDecimal, String) called by OrderService, and verifyPaymentSignature(...) called by the webhook logic in PaymentController.
- `backend/src/main/java/com/waydownsouth/controller/PaymentController.java` — CONTROLLER layer — exposes the POST /api/v1/payments/webhook/razorpay endpoint to receive notifications from Razorpay. It validates the webhook signature and calls OrderService.verifyPaymentAndUpdateOrder to finalize the order.
- `backend/src/main/java/com/waydownsouth/dto/RazorpayOrderResponse.java` — DTO layer — defines the response sent to the client after initiating an order. It contains all the necessary information (razorpayOrderId, amount, apiKey) for the frontend to open the Razorpay checkout modal.
- `backend/src/main/java/com/waydownsouth/dto/PaymentVerificationRequest.java` — DTO layer — defines the structure of the data required to verify a payment signature. This object is constructed from the Razorpay webhook payload and passed to the OrderService.

**Feature Instruction:**

### Feature: Payment Gateway Integration (Backend)

This feature integrates the Way Down South application with the Razorpay payment gateway. It provides services for creating payment orders and a webhook controller to handle payment confirmation callbacks from Razorpay.

#### Dependencies:
- Add the Razorpay Java SDK dependency to your `pom.xml`:
```

xml
<dependency>
    <groupId>com.razorpay</groupId>
    <artifactId>razorpay-java</artifactId>
    <version>1.4.3</version>
</dependency>


```

- Add the following configuration properties to `application.properties` and ensure they are populated with your Razorpay API credentials from environment variables:
```

properties
razorpay.key.id=${RAZORPAY_KEY_ID}
razorpay.key.secret=${RAZORPAY_KEY_SECRET}
razorpay.webhook.secret=${RAZORPAY_WEBHOOK_SECRET}


```

--- 

### I. DTO Layer

#### 1. `RazorpayOrderResponse.java`
This DTO transfers data required by the frontend to initialize the Razorpay Checkout modal.
- **Class:** `com.waydownsouth.dto.RazorpayOrderResponse`
- **Annotations:** Use Lombok's `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- **Fields:**
  - `private String razorpayOrderId;` // The order ID from Razorpay.
  - `private long amount;` // The order amount in the smallest currency unit (e.g., paise).
  - `private String currency;` // e.g., "INR".
  - `private String apiKey;` // The public Razorpay API key ID.

#### 2. `PaymentVerificationRequest.java`
This DTO encapsulates the data received from Razorpay needed to verify a payment's authenticity.
- **Class:** `com.waydownsouth.dto.PaymentVerificationRequest`
- **Annotations:** Use Lombok's `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- **Fields:**
  - `private String razorpayOrderId;`
  - `private String razorpayPaymentId;`
  - `private String razorpaySignature;`

---

### II. Service Layer

#### `PaymentService.java`
This service encapsulates all interactions with the Razorpay Java SDK.

- **Class:** `com.waydownsouth.service.PaymentService`
- **Annotations:** `@Service`
- **Fields:**
  - `@Value("${razorpay.key.id}") private String razorpayKeyId;`
  - `@Value("${razorpay.key.secret}") private String razorpayKeySecret;`
  - `private RazorpayClient razorpayClient;`
- **Constructor/Initialization:**
  - Use a `@PostConstruct` method to initialize the `razorpayClient`:
    ```

java
    @PostConstruct
    public void init() {
        try {
            this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        } catch (RazorpayException e) {
            // Log and handle initialization error
            throw new RuntimeException("Could not initialize Razorpay client", e);
        }
    }
    

```

- **Public Methods:**

  - **`public String createRazorpayOrder(BigDecimal amount, String currency)`**
    - **Description:** This method is called by `OrderService` (from the `order-core-backend` feature) to create an order in Razorpay.
    - **Logic:**
      1. Create a `JSONObject` named `orderRequest`.
      2. Convert the `amount` from `BigDecimal` to the smallest currency unit (paise for INR) by multiplying by 100 and converting to `long`.
      3. Put the following key-value pairs into `orderRequest`:
         - `"amount"`: The amount in paise.
         - `"currency"`: The `currency` parameter (e.g., "INR").
         - `"receipt"`: A unique receipt ID, e.g., `"receipt_" + UUID.randomUUID().toString()`.
      4. Call `this.razorpayClient.orders.create(orderRequest)`. This returns an `Order` object.
      5. Extract the Razorpay order ID from the returned `Order` object using `order.get("id")`.
      6. Return the order ID as a `String`.
    - **Error Handling:**
      - Wrap the logic in a `try-catch` block for `RazorpayException`.
      - If a `RazorpayException` is caught, log the error and throw a new `RuntimeException("Error creating Razorpay order", e)`. 

  - **`public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature)`**
    - **Description:** This method is called by `OrderService` to verify the signature of a successful payment.
    - **Logic:**
      1. Create a `JSONObject` named `attributes`.
      2. Put the following key-value pairs into `attributes`:
         - `"razorpay_order_id"`: `razorpayOrderId`
         - `"razorpay_payment_id"`: `razorpayPaymentId`
         - `"razorpay_signature"`: `razorpaySignature`
      3. Call the static utility method `com.razorpay.Utils.verifyPaymentSignature(attributes, this.razorpayKeySecret)`.
      4. Return the boolean result of this method call.
    - **Error Handling:**
      - Wrap the logic in a `try-catch` block for `RazorpayException`.
      - If a `RazorpayException` is caught, log the error and return `false`.

---

### III. Controller Layer

#### `PaymentController.java`
This controller exposes a webhook endpoint to receive payment status updates from Razorpay.

- **Class:** `com.waydownsouth.controller.PaymentController`
- **Annotations:** `@RestController`, `@RequestMapping("/api/v1/payments")`
- **Fields:**
  - `@Autowired private OrderService orderService;` (from `order-core-backend`)
  - `@Value("${razorpay.webhook.secret}") private String webhookSecret;`

- **API Endpoints:**

  - **`POST /webhook/razorpay`**
    - **Method:** `public ResponseEntity<Void> handleRazorpayWebhook(@RequestBody String payload, @RequestHeader("Razorpay-Signature") String signature)`
    - **Description:** Receives and processes payment confirmation webhooks from Razorpay.
    - **Logic:**
      1. **Verify Webhook Signature:**
         - Use the static utility `com.razorpay.Utils.verifyWebhookSignature(payload, signature, webhookSecret)`.
         - If verification fails (returns `false`), log a warning about the invalid signature and return `ResponseEntity.status(HttpStatus.BAD_REQUEST).build()`.
      2. **Parse Payload:**
         - Use an `ObjectMapper` to parse the `payload` JSON string into a `Map<String, Object>`.
         - Extract the event type: `String event = (String) parsedPayload.get("event");`.
      3. **Process Event:**
         - Check if `event` equals `"payment.captured"`. If it does not, log the received event for informational purposes and return `ResponseEntity.ok().build()` to acknowledge receipt without processing.
      4. **Extract Payment Details:**
         - If the event is `"payment.captured"`, navigate the parsed payload to extract payment details. The path is `payload -> payment -> entity`.
         - Get the `entity` map: `Map<String, Object> entity = (Map<String, Object>) ((Map<String, Object>) parsedPayload.get("payload")).get("payment");`
         - Extract the following values from the `entity` map:
           - `String razorpayOrderId = (String) entity.get("order_id");`
           - `String razorpayPaymentId = (String) entity.get("id");`
           - `String razorpaySignature = (String) entity.get("signature");`
      5. **Update Order Status:**
         - Create a new `PaymentVerificationRequest` object.
         - Populate it with the extracted `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature`.
         - Call `orderService.verifyPaymentAndUpdateOrder(paymentVerificationRequest)`.
      6. **Return Response:**
         - On successful processing, return `ResponseEntity.ok().build()`.
    - **Error Handling:**
      - If parsing the JSON payload fails (`JsonProcessingException`), log the error and return `ResponseEntity.status(HttpStatus.BAD_REQUEST).build()`.
      - If `orderService.verifyPaymentAndUpdateOrder` throws an exception (e.g., `OrderNotFoundException`), the global exception handler will catch it. The controller should let it propagate.

---

### IV. Inter-Feature Wiring

- The `OrderService` (from `order-core-backend`) will inject `PaymentService`.
  - `OrderService.initiateOrder(...)` will call `paymentService.createRazorpayOrder(...)` to get a Razorpay order ID.
  - `OrderService.verifyPaymentAndUpdateOrder(...)` will call `paymentService.verifyPaymentSignature(...)` to validate the payment.
- The `PaymentController` in this feature injects `OrderService`.
  - `PaymentController.handleRazorpayWebhook(...)` calls `orderService.verifyPaymentAndUpdateOrder(...)` after successfully validating and parsing a webhook from Razorpay.

---

## Core UI (Frontend)

**Name:** `core-ui-frontend`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/api/client.ts` — SERVICE layer — creates and configures a global Axios instance. It sets the baseURL from environment variables and adds a request interceptor to automatically attach the JWT 'Authorization: Bearer' header to all outgoing requests.
- `frontend/src/App.tsx` — PAGE layer — serves as the application's entry point, wrapping all pages and components with necessary providers like QueryClientProvider and AuthProvider, and defining the application's routing structure using React Router.
- `frontend/src/components/Layout.tsx` — COMPONENT layer — provides the main page structure for the public-facing site. It renders the Header, the main content area passed as children, and the Footer, ensuring a consistent look and feel across all pages.
- `frontend/src/components/Header.tsx` — COMPONENT layer — renders the main navigation bar. It includes the 'Way Down South' logo, links to Home, Menu, and Reservations, and a 'Order Now' call-to-action button. It is designed to be mobile-first and responsive.
- `frontend/src/components/Footer.tsx` — COMPONENT layer — renders the site footer. It contains the restaurant's address, a click-to-call phone number, hours of operation, and an embedded Google Maps view of the location.
- `frontend/src/pages/HomePage.tsx` — PAGE layer — constructs the main landing page. It includes a full-bleed hero section with vibrant food photography, a grid of featured menu items fetched via useMenu, a section about the restaurant's authenticity, and a call-to-action for ordering online.
- `frontend/src/pages/ContactPage.tsx` — PAGE layer — provides detailed contact and location information. It features a large, interactive Google Maps embed, the full address, a click-to-call phone number, and detailed opening hours for each day of the week.
- `frontend/src/pages/AdminDashboardPage.tsx` — PAGE layer — serves as the landing page for authenticated admins. It provides a sidebar navigation with links to '/admin/orders', '/admin/reservations', and '/admin/menu', and a main content area displaying summary statistics.

**Feature Instruction:**

### Feature: Core UI (Frontend)

This feature establishes the foundational UI structure, core pages, and API communication layer for the Way Down South frontend application. It includes the main application wrapper, shared layout components, public-facing pages like Home and Contact, the admin dashboard shell, and the configured Axios client for all backend communication.

#### Color Palette Reference:
-   **Turmeric Yellow**: `#d4a843`
-   **Chili Red**: `#c0392b`
-   **Banana Leaf Green**: `#4caf50`
-   **Off-White**: `#f8f8f8`
-   **Charcoal Grey**: `#1c1c1e`

--- 

### 1. API Client Configuration

#### `frontend/src/api/client.ts`
This file configures and exports a singleton Axios instance for all API calls.

**`apiClient` (AxiosInstance):**
1.  Create an Axios instance using `axios.create()`.
2.  Set the `baseURL` to the value of the environment variable `import.meta.env.VITE_API_BASE_URL`.
3.  Add a request interceptor using `apiClient.interceptors.request.use()`.
4.  Inside the interceptor's success callback:
    a. Retrieve the JWT token from local storage: `localStorage.getItem('authToken')`.
    b. If a token exists, add the `Authorization` header to the request configuration: `config.headers.Authorization = `Bearer ${token}`;`.
    c. Return the modified `config` object.
5.  Export the configured instance as `apiClient`.

### 2. Shared Layout Components

These components provide the consistent visual structure for the public-facing website.

#### `frontend/src/components/Header.tsx`
This component renders the main site navigation header.

**`Header()` (JSX.Element):**
1.  Create a `header` element with a dark background (`bg-[#1c1c1e]`) and padding.
2.  Inside, use a `div` with `container mx-auto` to constrain the content width and `flex justify-between items-center` for layout.
3.  **Branding**: On the left, render a `Link` (from `react-router-dom`) to `/`. It should contain the business name "Way Down South" styled as a logo with Turmeric Yellow text (`text-[#d4a843]`) and a bold, distinct font.
4.  **Desktop Navigation**: For medium screens and up, display a `nav` element containing `NavLink` components (from `react-router-dom`) for:
    *   "Home" (`/`)
    *   "Menu" (`/menu`)
    *   "Reservations" (`/reservations`)
    *   Style the active link with an underline or a change in color.
5.  **Call to Action**: To the right of the navigation links, render a `Link` styled as a button to `/order`. The button should have a Chili Red background (`bg-[#c0392b]`) and white text, with the copy "Order Now".
6.  **Mobile Navigation**: For screens smaller than medium, hide the desktop navigation and CTA. Show a hamburger menu icon button.
    *   Implement state (e.g., `useState`) to toggle the mobile menu's visibility.
    *   When open, the mobile menu should appear as an overlay or a dropdown, containing the same navigation links and the "Order Now" button, stacked vertically.

#### `frontend/src/components/Footer.tsx`
This component renders the site footer.

**`Footer()` (JSX.Element):**
1.  Create a `footer` element with a dark background (`bg-[#1c1c1e]`) and light text (`text-gray-300`).
2.  Use a responsive grid layout (e.g., `grid grid-cols-1 md:grid-cols-3 gap-8`) within a `container mx-auto`.
3.  **Column 1: Contact & Address**
    *   Heading: "Visit Us"
    *   Address: `123 Spice Route, Bangalore, KA 560001`
    *   Phone: A link with `href="tel:+919876543210"` displaying `+91 98765 43210`.
4.  **Column 2: Hours of Operation**
    *   Heading: "Hours"
    *   List the hours: `Mon - Fri: 11:00 AM - 10:00 PM`, `Sat - Sun: 10:00 AM - 11:00 PM`.
5.  **Column 3: Location Map**
    *   Embed a Google Maps `iframe` pointing to the restaurant's address.
6.  Below the grid, add a `div` for a copyright notice: `© 2024 Way Down South. All Rights Reserved.`

#### `frontend/src/components/Layout.tsx`
This component wraps page content to provide a consistent header and footer.

**`Layout({ children }: { children: React.ReactNode })` (JSX.Element):**
1.  Render a root `div` with a flexbox column layout that takes up the full viewport height (`min-h-screen flex flex-col`).
2.  Render the `<Header />` component.
3.  Render a `main` element with `className="flex-grow"`. Inside this element, render the `children` prop.
4.  Render the `<Footer />` component.

### 3. Public Pages

#### `frontend/src/pages/HomePage.tsx`
This is the main landing page for the restaurant.

**`HomePage()` (JSX.Element):**
1.  Wrap the entire page content in the `<Layout>` component.
2.  **Hero Section**: A full-width section with a high-quality background image of South Indian cuisine.
    *   Overlay a content `div` with a semi-transparent dark background for text readability.
    *   Add a main heading `h1`: "Authentic Flavors of South India".
    *   Add a subheading `p`: "Experience tradition in every bite, delivered to your door."
    *   Include a prominent CTA `Link` button to `/order` with Chili Red background (`bg-[#c0392b]`) and text "Order Online Now".
3.  **Menu Highlights Section**: A section with a clean, off-white background (`bg-[#f8f8f8]`).
    *   Heading `h2`: "Our Signature Dishes".
    *   Use the `useMenu` hook from `frontend/src/hooks/useMenu.ts` (from the `menu-display-frontend` feature) to fetch menu items: `const { data: menuItems, isLoading } = useMenu({});`.
    *   Display a loading state if `isLoading` is true.
    *   Render a responsive grid of the first 3 or 4 items from `menuItems`. For each item, use the `MenuItemCard` component (from `menu-display-frontend`), passing the item data as a prop.
    *   Include a `Link` styled as a secondary button to `/menu` with the text "View Full Menu".
4.  **Authenticity Section**: A section detailing the restaurant's story.
    *   Use a two-column layout.
    *   Left column: An image of the restaurant's interior or chefs.
    *   Right column: Heading `h2` "Straight from the Heart of the South" and paragraph text about using traditional recipes and fresh, local ingredients.

#### `frontend/src/pages/ContactPage.tsx`
This page provides detailed contact and location information.

**`ContactPage()` (JSX.Element):**
1.  Wrap the entire page content in the `<Layout>` component.
2.  Inside a `container mx-auto`, add a main heading `h1`: "Get In Touch".
3.  Use a responsive two-column layout.
4.  **Left Column**: A large, interactive Google Maps `iframe` showing the restaurant's location.
5.  **Right Column**: Display contact details clearly.
    *   Heading `h3`: "Our Location"
    *   Address: `123 Spice Route, Bangalore, KA 560001`
    *   Heading `h3`: "Contact Us"
    *   Phone: A link with `href="tel:+919876543210"`.
    *   Email: `contact@waydownsouth.com`.
    *   Heading `h3`: "Opening Hours"
    *   Provide a detailed list of hours for each day of the week.

### 4. Admin Portal Shell

#### `frontend/src/pages/AdminDashboardPage.tsx`
This is the main dashboard for authenticated admin users. It does **not** use the public `<Layout>`.

**`AdminDashboardPage()` (JSX.Element):**
1.  Import and use the `useAuth` hook from `frontend/src/hooks/useAuth.ts` (`authentication-frontend` feature): `const { user, logout } = useAuth();`.
2.  Render a root `div` with a flex layout (`flex h-screen`).
3.  **Sidebar**: A `aside` element with a fixed width, dark background (`bg-[#1c1c1e]`), and light text.
    *   Display the restaurant name "Way Down South - Admin" at the top.
    *   Render a `nav` element with a vertical list of `NavLink` components for admin routes:
        *   `/admin/dashboard` (Dashboard)
        *   `/admin/orders` (Orders)
        *   `/admin/reservations` (Reservations)
        *   `/admin/menu` (Menu)
    *   At the bottom of the sidebar, include a "Logout" button that calls the `logout` function from `useAuth` on click.
4.  **Main Content Area**: A `main` element that takes the remaining space (`flex-grow`) with padding and a light background color.
    *   Display a welcome message: `<h1>Welcome, {user?.email || 'Admin'}</h1>`.
    *   Render a grid of summary cards (as placeholders for now):
        *   Card 1: Title "Today's Orders", Value "15"
        *   Card 2: Title "Pending Reservations", Value "8"
        *   Card 3: Title "Total Menu Items", Value "42"

### 5. Application Root & Routing

#### `frontend/src/App.tsx`
This is the root component of the application, responsible for context providers and routing.

**`App()` (JSX.Element):**
1.  Instantiate a `QueryClient` from `@tanstack/react-query`.
2.  Wrap the entire application in the following providers, in this order:
    a. `QueryClientProvider`, passing the client instance.
    b. `AuthProvider` (from `frontend/src/context/AuthContext.tsx` in `authentication-frontend`).
    c. `CartProvider` (from `frontend/src/context/CartContext.tsx` in `order-checkout-frontend`).
    d. `BrowserRouter` from `react-router-dom`.
3.  Inside `BrowserRouter`, define the application's routes using `<Routes>` and `<Route>`.
4.  **Public Routes**:
    *   `<Route path="/" element={<HomePage />} />`
    *   `<Route path="/menu" element={<MenuPage />} />` (Import `MenuPage` from `menu-display-frontend`)
    *   `<Route path="/reservations" element={<ReservationPage />} />` (Import `ReservationPage` from `reservation-booking-frontend`)
    *   `<Route path="/order" element={<OrderPage />} />` (Import `OrderPage` from `order-checkout-frontend`)
    *   `<Route path="/contact" element={<ContactPage />} />`
    *   `<Route path="/login" element={<LoginPage />} />` (Import `LoginPage` from `authentication-frontend`)
5.  **Admin Routes**: These routes must be wrapped in the `ProtectedRoute` component from `authentication-frontend`.
    *   `<Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />`
    *   `<Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />`
    *   `<Route path="/admin/menu" element={<ProtectedRoute><AdminMenuPage /></ProtectedRoute>} />` (Import `AdminMenuPage` from `admin-portal-frontend`)
    *   `<Route path="/admin/reservations" element={<ProtectedRoute><AdminReservationsPage /></ProtectedRoute>} />` (Import `AdminReservationsPage` from `admin-portal-frontend`)
    *   `<Route path="/admin/orders" element={<ProtectedRoute><AdminOrdersPage /></ProtectedRoute>} />` (Import `AdminOrdersPage` from `admin-portal-frontend`)

---

## Authentication (Frontend)

**Name:** `authentication-frontend`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/types/auth.ts` — DTO layer — defines the TypeScript interface AuthResponse, ensuring type safety and consistency between the frontend authService and the backend's /api/v1/auth/login endpoint response.
- `frontend/src/context/AuthContext.tsx` — CONTEXT layer — manages global authentication state (token, user role). It exposes functions like login(email, password) and logout() to the application and persists the auth state to localStorage.
- `frontend/src/services/authService.ts` — SERVICE layer — encapsulates the API call for authentication. Its primary function, login(email, password), makes a POST request to /api/v1/auth/login using the shared Axios client.
- `frontend/src/hooks/useAuth.ts` — HOOK layer — provides a simple interface for components to access the authentication state and functions (e.g., login, logout, isAuthenticated) from the AuthContext without needing to directly use React's useContext.
- `frontend/src/components/ProtectedRoute.tsx` — COMPONENT layer — acts as a guard for routes in App.tsx. It uses the useAuth hook to check if a user is authenticated; if not, it redirects them to the /login page.
- `frontend/src/pages/LoginPage.tsx` — PAGE layer — displays the login form for administrators. It uses react-hook-form for form state management and validation, and calls the login function from the useAuth hook upon submission.

**Feature Instruction:**

This feature implements the complete frontend authentication flow for administrators of 'Way Down South'. It includes a login page, global state management for authentication status, an API service to communicate with the backend, and a protected route component to guard admin-only sections of the application.

### 1. Type Definition (`frontend/src/types/auth.ts`)

This file defines the data structure for the authentication response from the backend.

**`AuthResponse` interface**
- Create an interface named `AuthResponse`.
- It must contain the following properties:
  - `token`: `string`
  - `role`: `string` (e.g., 'ROLE_ADMIN')

### 2. Authentication API Service (`frontend/src/services/authService.ts`)

This service encapsulates the API call to the backend's login endpoint.

- **Imports**: Import the default exported Axios instance from `frontend/src/api/client.ts` and the `AuthResponse` type from `frontend/src/types/auth.ts`.

- **`login(email: string, password: string): Promise<AuthResponse>` function**
  1. This function must be `async`.
  2. It accepts `email` and `password` as string arguments.
  3. Make a `POST` request to the backend endpoint `/api/v1/auth/login` using the imported Axios client.
  4. The request body must be an object with `email` and `password` properties.
  5. The function should return the `data` property from the Axios response, which will be typed as `AuthResponse`.
  6. Axios will automatically handle non-2xx responses by throwing an error, which will be caught by the calling function in the `AuthContext`.

### 3. Global Authentication State (`frontend/src/context/AuthContext.tsx` and `frontend/src/hooks/useAuth.ts`)

These files create a React Context and a custom hook to manage and provide authentication state throughout the application.

#### `AuthContext.tsx`

- **Imports**: Import React hooks (`createContext`, `useState`, `useEffect`, `useMemo`), `authService` from `../services/authService.ts`.

- **`AuthContextType` Interface**
  - Define an interface `AuthContextType` with the following properties:
    - `token`: `string | null`
    - `role`: `string | null`
    - `isAuthenticated`: `boolean`
    - `isLoading`: `boolean`
    - `login`: `(email: string, password: string) => Promise<void>`
    - `logout`: `() => void`

- **`AuthContext` Creation**
  - Create the context using `createContext<AuthContextType | undefined>(undefined)`.

- **`AuthProvider` Component**
  - This component will provide the authentication context to its children.
  - **Props**: It accepts `{ children: React.ReactNode }`.
  - **State Management**:
    - Use `useState<string | null>(null)` to manage the `token`.
    - Use `useState<string | null>(null)` to manage the `role`.
    - Use `useState<boolean>(true)` for an initial `isLoading` state to check localStorage.
  - **Initialization (`useEffect`)**:
    1. Create a `useEffect` hook that runs once on component mount (`[]` dependency array).
    2. Inside, try to retrieve `token` and `role` from `localStorage`.
    3. If a token is found, set the `token` and `role` state variables.
    4. Set `isLoading` to `false` after checking localStorage.
  - **`login` function**: `async (email: string, password: string): Promise<void>`
    1. Set `isLoading` to `true`.
    2. Wrap the logic in a `try...catch...finally` block.
    3. **`try` block**: 
       - Call `authService.login(email, password)` and await the result.
       - On success, destructure `token` and `role` from the response.
       - Update the `token` and `role` state with the received values.
       - Store the `token` and `role` in `localStorage` (e.g., `localStorage.setItem('token', token)`).
    4. **`catch` block**: 
       - Log the error to the console.
       - Clear the `token` and `role` state (set to `null`).
       - Remove `token` and `role` from `localStorage`.
       - Re-throw the error so the UI component can handle it (e.g., display an error message).
    5. **`finally` block**: Set `isLoading` to `false`.
  - **`logout` function**: `() => void`
    1. Set `token` and `role` state to `null`.
    2. Remove `token` and `role` from `localStorage`.
  - **Context Value**:
    - Use `useMemo` to create the context value object. This object should include:
      - `token`
      - `role`
      - `isAuthenticated`: derived from `!!token`.
      - `isLoading`
      - `login`
      - `logout`
    - The dependencies for `useMemo` should be `[token, role, isLoading]`.
  - **Return Value**: Return `<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>`.

#### `useAuth.ts`

- **Imports**: Import `useContext` from 'react' and `AuthContext` from `../context/AuthContext.tsx`.
- **`useAuth` function**: `(): AuthContextType`
  1. Get the context by calling `useContext(AuthContext)`.
  2. Check if the context is `undefined`. If it is, throw a new `Error('useAuth must be used within an AuthProvider')`.
  3. Return the context.

### 4. UI and Routing (`frontend/src/pages/LoginPage.tsx` and `frontend/src/components/ProtectedRoute.tsx`)

#### `LoginPage.tsx`

This page provides the login form for administrators.

- **Imports**: `useAuth` hook, `react-hook-form`, `useNavigate` from `react-router-dom`, and UI components from Shadcn/UI (`Button`, `Card`, `Input`, `Label`, `Form`).
- **Component Logic**:
  1. Use the `useAuth` hook to get the `login` function and `isLoading` state.
  2. Use the `useNavigate` hook for redirection after login.
  3. Use `react-hook-form` to manage the form state for `email` and `password` fields. Implement basic validation (e.g., required fields, valid email format).
  4. Create an `onSubmit` handler that takes the form data and calls the `login(data.email, data.password)` function from the auth context.
  5. On successful login, navigate the user to the admin dashboard (`/admin/dashboard`).
  6. If the `login` call fails, use the `setError` function from `react-hook-form` to display a generic error message on the form (e.g., 'Invalid email or password').
- **Layout and Styling (Design Context)**:
  - The page should have a clean, centered layout. Use a `div` with `min-h-screen flex items-center justify-center bg-[#f8f8f8]` as the main container.
  - Use a `Card` component from Shadcn/UI to contain the form, with a max-width (e.g., `max-w-md`).
  - The `CardHeader` should contain a `CardTitle` with the text "Way Down South - Admin Login".
  - The form should contain two fields for 'Email' and 'Password', using `Label` and `Input` components.
  - The submit `Button` should display "Log In". When `isLoading` is true, the button should be disabled and show a loading spinner.
  - The primary button color should be Turmeric Yellow. Use a Tailwind arbitrary value: `bg-[#d4a843] hover:bg-[#d4a843]/90`.

#### `ProtectedRoute.tsx`

This component protects routes from unauthenticated access.

- **Imports**: `useAuth` hook, `Navigate` and `useLocation` from `react-router-dom`.
- **Component Logic**:
  1. **Props**: It accepts `{ children: JSX.Element }`.
  2. Use the `useAuth` hook to get `isAuthenticated` and `isLoading`.
  3. Use the `useLocation` hook to get the current location.
  4. **Loading State**: If `isLoading` is true (while checking localStorage), render a loading indicator (e.g., a simple `<div>Loading...</div>`) to prevent a flicker to the login page.
  5. **Authentication Check**: If `!isAuthenticated` after loading is complete, render `<Navigate to="/login" state={{ from: location }} replace />` to redirect the user to the login page, while preserving the location they intended to visit.
  6. **Authenticated State**: If `isAuthenticated` is true, render the `children`.

### 5. Integration into the Application

To make this feature work, you will need to modify `App.tsx` (from the `core-ui-frontend` feature).

1.  **Wrap the App**: In `App.tsx`, wrap the entire `Router` or the root layout component with the `AuthProvider`.
2.  **Define Routes**: In the routing configuration within `App.tsx`:
    -   Define the public route for `/login` that renders the `LoginPage` component.
    -   Wrap all admin-specific routes (e.g., `/admin/dashboard`, `/admin/menu`) with the `ProtectedRoute` component. Example:
        ```

jsx
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        

```

---

## Menu Display (Frontend)

**Name:** `menu-display-frontend`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/types/menu.ts` — DTO layer — defines the TypeScript interface MenuItem, ensuring type safety for data fetched from the /api/v1/menu/items endpoint and used across the menu feature's service, hook, and components.
- `frontend/src/services/menuService.ts` — SERVICE layer — encapsulates API calls to the public menu endpoints. It provides getMenuItems() and getMenuCategories() functions that are called by the useMenu hook.
- `frontend/src/hooks/useMenu.ts` — HOOK layer — uses React Query to fetch and cache menu data. It calls functions from menuService.ts and provides components like MenuPage with a simple interface to access data, loading, and error states.
- `frontend/src/pages/MenuPage.tsx` — PAGE layer — displays the full digital menu. It uses the useMenu and useMenuCategories hooks to fetch data and renders a filterable grid of MenuItemCard components. Includes Schema.org structured data for the menu.
- `frontend/src/components/MenuItemCard.tsx` — COMPONENT layer — a reusable component that displays a single menu item's image, name, description, and price. Styled with a charcoal background (bg-[#1c1c1e]), off-white text (text-[#f5f0e8]), and a turmeric yellow price (text-[#d4a843]).

**Feature Instruction:**

This feature implements the customer-facing menu display for the Way Down South restaurant. It includes a filterable and searchable menu page built with React, TypeScript, and React Query for efficient data fetching and state management.

### 1. Data Type Definition (`frontend/src/types/menu.ts`)

Create the `menu.ts` file to define the core data structure for a menu item. This ensures type safety across the feature.

**`MenuItem` interface**
This interface must match the `MenuItemDto` from the backend. Define it with the following properties:
- `id`: `string` (UUID)
- `name`: `string`
- `description`: `string`
- `price`: `number`
- `categoryName`: `string`
- `imageUrl`: `string`

### 2. API Service (`frontend/src/services/menuService.ts`)

This service encapsulates all API interactions related to the public menu. It will use the pre-configured Axios instance exported as `api` from `frontend/src/api/client.ts`.

**Imports:**
- `api` from `../api/client`
- `MenuItem` from `../types/menu`

**`getMenuItems(params: { category?: string, search?: string }): Promise<MenuItem[]>`**
- **Signature**: `export const getMenuItems = async (params: { category?: string, search?: string }): Promise<MenuItem[]> => { ... }`
- **Logic**:
  1. Make a GET request to the backend endpoint `/api/v1/menu/items` using the `api` client.
  2. Pass the `params` object directly to the request configuration. Axios will automatically format `{ category, search }` as URL query parameters.
  3. The endpoint is defined in the `menu-management-backend` feature.
  4. On success, return the `data` from the response, which will be an array of `MenuItem` objects.
  5. Axios will handle non-2xx responses by throwing an error, which will be caught by React Query in the hook layer.

**`getMenuCategories(): Promise<string[]>`**
- **Signature**: `export const getMenuCategories = async (): Promise<string[]> => { ... }`
- **Logic**:
  1. Make a GET request to `/api/v1/menu/categories`.
  2. This endpoint is defined in the `menu-management-backend` feature.
  3. On success, return the `data` from the response, which is an array of category name strings.

### 3. State Management Hooks (`frontend/src/hooks/useMenu.ts`)

These custom hooks use `@tanstack/react-query` to fetch, cache, and manage the state of menu data.

**Imports:**
- `useQuery` from `@tanstack/react-query`
- `getMenuItems`, `getMenuCategories` from `../services/menuService`
- `MenuItem` from `../types/menu`

**`useMenu(params: { category?: string, search?: string }): { data: MenuItem[], isLoading: boolean, error: Error | null }`**
- **Signature**: `export const useMenu = (params: { category?: string, search?: string }) => { ... }`
- **Logic**:
  1. Call `useQuery` from React Query.
  2. Set the `queryKey` to `['menuItems', params]`. This ensures the query is re-fetched whenever `category` or `search` parameters change.
  3. Set the `queryFn` to `() => getMenuItems(params)`.
  4. Return the result of the `useQuery` call, which includes `data`, `isLoading`, and `error`.

**`useMenuCategories(): { data: string[], isLoading: boolean, error: Error | null }`**
- **Signature**: `export const useMenuCategories = () => { ... }`
- **Logic**:
  1. Call `useQuery`.
  2. Set the `queryKey` to `['menuCategories']`.
  3. Set the `queryFn` to `getMenuCategories`.
  4. Return the result.

### 4. UI Component (`frontend/src/components/MenuItemCard.tsx`)

This component renders a single menu item in a card format, styled according to the design context.

**Imports:**
- `React` from `react`
- `MenuItem` from `../types/menu`

**`MenuItemCard({ item: MenuItem }): JSX.Element`**
- **Props**: Accepts a single prop `item` of type `MenuItem`.
- **Structure & Styling**:
  1. The root element should be a `div` with a charcoal background (`bg-[#1c1c1e]`), rounded corners, and a subtle shadow.
  2. Display the `item.imageUrl` in an `img` tag at the top of the card. Ensure it has an `alt` attribute set to `item.name`.
  3. Below the image, create a `div` for the text content with padding.
  4. Display `item.name` in an `h3` tag with a bold font and off-white text (`text-[#f5f0e8]`).
  5. Display `item.description` in a `p` tag with smaller, off-white text (`text-[#f5f0e8]`).
  6. Display the `item.price` in a `p` tag. The text should be bold, in Turmeric Yellow (`text-[#d4a843]`), and formatted as a currency (e.g., `₹${item.price.toFixed(2)}`).

### 5. Page Component (`frontend/src/pages/MenuPage.tsx`)

This page brings all the pieces together to display the full, interactive menu.

**Imports:**
- `React`, `useState`, `useEffect`, `useMemo` from `react`
- `useMenu`, `useMenuCategories` from `../hooks/useMenu`
- `Layout` from `../components/Layout` (from `core-ui-frontend`)
- `MenuItemCard` from `../components/MenuItemCard`

**Component Logic (`MenuPage`):**
1.  **State Management**:
    -   `const [selectedCategory, setSelectedCategory] = useState<string>('All');`
    -   `const [searchTerm, setSearchTerm] = useState<string>('');`
    -   `const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');`
2.  **Data Fetching**:
    -   Call `useMenuCategories()` to get the list of categories: `const { data: categories, isLoading: categoriesLoading } = useMenuCategories();`
    -   Call `useMenu` with the current filters: `const { data: menuItems, isLoading: itemsLoading, error } = useMenu({ category: selectedCategory === 'All' ? undefined : selectedCategory, search: debouncedSearchTerm });`
3.  **Debouncing Search Input**:
    -   Use a `useEffect` with a `setTimeout` to update `debouncedSearchTerm` 500ms after `searchTerm` stops changing. This prevents API calls on every keystroke.
4.  **Component Structure & Content**:
    -   Wrap the entire page content in the `<Layout>` component.
    -   **Header Section**: Add an `h1` with the title "Our Menu" and a `p` tag with welcoming text like "Explore the authentic flavors of South India, from our kitchen to your table."
    -   **Filter & Search Section**:
        -   Render a search `input` field. Its `value` should be `searchTerm` and its `onChange` handler should update `setSearchTerm`.
        -   Render a list of filter buttons. First, a button for "All". Then, map over the `categories` data to render a button for each category. The active button should have a distinct style (e.g., Turmeric Yellow background `bg-[#d4a843]`). The `onClick` handler for each button should call `setSelectedCategory` with the corresponding category name.
    -   **Menu Grid Section**:
        -   If `itemsLoading` is true, display a loading indicator (e.g., skeleton cards or a spinner).
        -   If `error` is present, display an error message.
        -   If data is available, render a responsive grid (e.g., `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`).
        -   Map over the `menuItems` array and render a `<MenuItemCard item={item} key={item.id} />` for each item.
5.  **SEO & Structured Data**:
    -   Include a `<script type="application/ld+json">` tag within the component's return statement (e.g., using React Helmet or directly in the JSX).
    -   The script's content should be a JSON-stringified object for Schema.org.
    -   Use `useMemo` to generate this JSON string so it only recalculates when `menuItems` changes.
    -   **JSON-LD Structure**:
        ```

json
        {
          "@context": "https://schema.org",
          "@type": "Menu",
          "name": "Way Down South Menu",
          "hasMenuItem": [
            // Map over menuItems here
            {
              "@type": "MenuItem",
              "name": "item.name",
              "description": "item.description",
              "image": "item.imageUrl",
              "offers": {
                "@type": "Offer",
                "price": "item.price.toString()",
                "priceCurrency": "INR"
              }
            }
          ]
        }
        

```

### How Files Interact
-   `MenuPage.tsx` is the entry point. It uses the `useMenu` and `useMenuCategories` hooks to fetch data.
-   Based on user interaction (clicking a category or typing in search), `MenuPage.tsx` updates its state, which causes the `useMenu` hook to re-fetch with new parameters.
-   The `useMenu` and `useMenuCategories` hooks in `useMenu.ts` call the corresponding functions in `menuService.ts`.
-   `menuService.ts` executes the actual HTTP requests to the backend API.
-   `MenuPage.tsx` receives the fetched data and renders a grid of `MenuItemCard.tsx` components.
-   `menu.ts` provides the `MenuItem` type definition used by the service, hooks, and components to ensure type consistency.

---

## Reservation Booking (Frontend)

**Name:** `reservation-booking-frontend`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/types/reservation.ts` — DTO layer — defines TypeScript interfaces for reservation requests and responses, ensuring type safety between the frontend forms, services, and the backend API.
- `frontend/src/services/reservationService.ts` — SERVICE layer — encapsulates the API call for creating a reservation. Its createReservation(data) function makes a POST request to /api/v1/reservations and is called by the useReservations hook.
- `frontend/src/hooks/useReservations.ts` — HOOK layer — uses React Query's useMutation to handle the reservation creation process. It calls reservationService.createReservation and manages the loading, error, and success states for the UI.
- `frontend/src/pages/ReservationPage.tsx` — PAGE layer — provides the main user interface for booking a table. It primarily renders the ReservationForm component and displays success or error messages based on the form submission state.
- `frontend/src/components/ReservationForm.tsx` — COMPONENT layer — implements the reservation form using react-hook-form and Zod for validation. On submit, it calls the mutate function from the useCreateReservation hook to send the data to the backend.

**Feature Instruction:**

This feature implements the complete frontend user flow for booking a table at "Way Down South". It consists of a reservation page containing a form, a React Query hook to manage the API call state, a service to perform the API call, and TypeScript types for data consistency.

### 1. TypeScript Types (`frontend/src/types/reservation.ts`)

This file defines the data structures for reservation requests and responses, ensuring type safety across the frontend.

- **`CreateReservationRequest` interface**: This matches the backend DTO for creating a reservation. It must contain the following properties:
  - `customerName`: `string`
  - `email`: `string`
  - `phone`: `string`
  - `reservationTime`: `string` (ISO 8601 format, e.g., `2024-12-25T19:00:00`)
  - `partySize`: `number`

- **`ReservationResponse` interface**: This matches the backend DTO for a created reservation. It must contain the following properties:
  - `id`: `string` (UUID)
  - `customerName`: `string`
  - `email`: `string`
  - `phone`: `string`
  - `reservationTime`: `string` (ISO 8601 format)
  - `partySize`: `number`
  - `status`: `string` (e.g., 'CONFIRMED', 'PENDING')

### 2. API Service (`frontend/src/services/reservationService.ts`)

This service encapsulates the logic for making the API call to the backend reservation endpoint.

- **Dependencies**:
  - Import `apiClient` from `../api/client` (this is a pre-configured Axios instance).
  - Import `CreateReservationRequest` and `ReservationResponse` from `../types/reservation.ts`.

- **`createReservation` function**:
  - **Signature**: `createReservation(data: CreateReservationRequest): Promise<ReservationResponse>`
  - **Logic**:
    1. Make a `POST` request to the backend endpoint `/api/v1/reservations` using `apiClient.post<ReservationResponse>()`.
    2. Pass the `data` object as the request body.
    3. Return the `data` property from the resolved Axios response.

### 3. React Query Hook (`frontend/src/hooks/useReservations.ts`)

This custom hook uses React Query's `useMutation` to manage the state of the reservation creation process (loading, error, success).

- **Dependencies**:
  - Import `useMutation`, `UseMutationResult` from `@tanstack/react-query`.
  - Import `reservationService` from `../services/reservationService.ts`.
  - Import `CreateReservationRequest`, `ReservationResponse` from `../types/reservation.ts`.

- **`useCreateReservation` function**:
  - **Signature**: `useCreateReservation(): UseMutationResult<ReservationResponse, Error, CreateReservationRequest>`
  - **Logic**:
    1. Call `useMutation` from React Query.
    2. Provide an object with a `mutationFn` property.
    3. The value of `mutationFn` should be `reservationService.createReservation`.
    4. Return the result of the `useMutation` call.

### 4. Reservation Form Component (`frontend/src/components/ReservationForm.tsx`)

This component renders the user-facing form for booking a table. It handles form state, validation, and submission.

- **Dependencies**:
  - `react-hook-form` for form management.
  - `zod` and `@hookform/resolvers/zod` for validation.
  - `useCreateReservation` hook from `../hooks/useReservations.ts`.
  - `shadcn/ui` components (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Button`, `Calendar`, `Popover`, `PopoverTrigger`, `PopoverContent`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`).

- **Component Logic**:
  1. **State Management**: Call `useCreateReservation()` to get mutation functions and state (`mutate`, `isPending`, `isSuccess`, `isError`, `error`, `data`).
  2. **Validation**: Define a `zod` schema for the form fields that corresponds to the `CreateReservationRequest` type. Include sensible constraints (e.g., name is required, email is valid, party size is between 1 and 12, date is in the future).
  3. **Form Setup**: Initialize `react-hook-form` using `useForm` with the Zod resolver.
  4. **`onSubmit` Handler**: This function will be called by `react-hook-form`. It receives the validated form data and calls `mutate(data)` from the `useCreateReservation` hook.
  5. **UI Rendering**:
     - If `isSuccess` is true, render a success message. The message should be warm and welcoming, like: "Thank you, {data.customerName}! Your table for {data.partySize} is confirmed for {formatted date and time}. A confirmation has been sent to {data.email}." Do not render the form.
     - If `isSuccess` is false, render the form using `shadcn/ui` components.
     - The form should contain the following fields:
       - **Customer Name**: `Input` type `text`.
       - **Email**: `Input` type `email`.
       - **Phone Number**: `Input` type `tel`.
       - **Date**: Use a `Popover` containing a `Calendar` for date selection.
       - **Time**: Use a `Select` with 30-minute intervals (e.g., 5:00 PM, 5:30 PM...). You can pre-populate a list of available times.
       - **Party Size**: Use a `Select` for numbers 1 through 12.
     - The submit `Button` should display "Confirm Reservation". Its background should be the primary Turmeric Yellow color (`bg-[#d4a843]`). It must be disabled when `isPending` is true.
     - If `isError` is true, display a user-friendly error message below the form, for example: "Sorry, we couldn't complete your reservation. Please try again later."

### 5. Reservation Page (`frontend/src/pages/ReservationPage.tsx`)

This page serves as the entry point for the reservation flow, providing context and rendering the form.

- **Dependencies**:
  - `Layout` from `../components/Layout.tsx`.
  - `ReservationForm` from `../components/ReservationForm.tsx`.

- **Component Logic**:
  1. Render the main `Layout` component to ensure consistent header and footer.
  2. Inside the layout, create a main content container with vertical padding (`py-16` or `py-20`) and centered content (`max-w-3xl mx-auto px-4`).
  3. Display a heading (`h1`) with text like "Reserve Your Table at Way Down South" in a prominent, large font.
  4. Below the heading, add a paragraph (`p`) with welcoming text: "Experience the authentic flavors of South India. Book your table online for a memorable dining experience."
  5. Render the `<ReservationForm />` component below the introductory text.

### Inter-file Wiring Summary:

- `ReservationPage.tsx` renders `ReservationForm.tsx`.
- `ReservationForm.tsx` uses the `useCreateReservation` hook from `useReservations.ts` to handle form submission.
- `useReservations.ts` calls `reservationService.createReservation` from `reservationService.ts` as its mutation function.
- `reservationService.ts` makes the `POST /api/v1/reservations` API call using a shared Axios client.
- `reservation.ts` provides the TypeScript types (`CreateReservationRequest`, `ReservationResponse`) used consistently through the form, hook, and service layers.

---

## Order Checkout Flow (Frontend)

**Name:** `order-checkout-frontend`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/types/order.ts` — DTO layer — defines TypeScript interfaces for the online ordering flow, including CreateOrderRequest and RazorpayOrderResponse, to ensure type safety between the frontend checkout form and the backend API.
- `frontend/src/context/CartContext.tsx` — CONTEXT layer — manages the state of the customer's shopping cart. It exposes functions like addItem(item, quantity), removeItem(itemId), and clearCart(), and persists the cart state in localStorage.
- `frontend/src/services/orderService.ts` — SERVICE layer — encapsulates the API call to initiate an order. Its createOrder(data) function makes a POST request to /api/v1/orders and returns the data needed to start the Razorpay payment flow.
- `frontend/src/hooks/useOrders.ts` — HOOK layer — uses React Query's useMutation to handle the order creation process. It calls orderService.createOrder and manages the loading, error, and success states, triggering the Razorpay checkout on success.
- `frontend/src/pages/OrderPage.tsx` — PAGE layer — orchestrates the checkout flow. It displays the items from the CartContext, renders the CheckoutForm for user details, and shows the final order summary.
- `frontend/src/components/CheckoutForm.tsx` — COMPONENT layer — implements the form for collecting customer name, phone, and address. On submit, it combines form data with items from the CartContext and calls the mutate function from the useCreateOrder hook.

**Feature Instruction:**

This feature implements the complete frontend for the customer order and checkout flow for 'Way Down South'. It includes cart state management, a checkout form for customer details, and integration with the Razorpay payment gateway.

### 1. Type Definitions (`frontend/src/types/order.ts`)

This file defines the TypeScript interfaces for data transfer objects (DTOs) used in the ordering process, ensuring type safety between the frontend and the backend API.

**`CreateOrderRequest` interface:**
Represents the payload sent to the backend to create an order.
```

typescript
interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{ 
    menuItemId: string;
    quantity: number;
    price: number;
  }>;
}


```

**`RazorpayOrderResponse` interface:**
Represents the response from the backend after successfully initiating an order. This data is used to configure the Razorpay payment modal.
```

typescript
interface RazorpayOrderResponse {
  key: string;
  amount: number; // in the smallest currency unit (e.g., paise for INR)
  currency: string;
  name: string;
  razorpayOrderId: string;
}


```

### 2. Cart State Management (`frontend/src/context/CartContext.tsx`)

This file implements a React Context to manage the user's shopping cart state globally. The cart's state is persisted in `localStorage`.

**`CartItem` type:**
Define a type for items within the cart.
```

typescript
interface CartItem {
  id: string; // Corresponds to MenuItem ID
  name: string;
  price: number;
  quantity: number;
}


```

**`CartContext`:**
- The context will provide the cart state (`cartItems`) and functions to manipulate it: `addItem`, `removeItem`, `updateItemQuantity`, `clearCart`, and `getCartTotal`.

**`CartProvider` component:**
- **Signature:** `CartProvider({ children: React.ReactNode }): JSX.Element`
- **Logic:**
  1. Initialize a `cartItems` state variable using `useState`, lazy-loading the initial state from `localStorage`. If `localStorage` has a 'cart' item, parse it; otherwise, default to an empty array `[]`.
  2. Use a `useEffect` hook to synchronize the `cartItems` state with `localStorage` whenever it changes. `JSON.stringify` the `cartItems` and save it under the key 'cart'.
  3. Implement the following functions that modify the `cartItems` state:
     - `addItem(item: Omit<CartItem, 'quantity'>, quantity: number)`: If the item already exists in the cart, update its quantity. Otherwise, add it as a new item.
     - `removeItem(itemId: string)`: Remove an item from the cart by its ID.
     - `updateItemQuantity(itemId: string, quantity: number)`: Find an item by ID and update its quantity. If quantity becomes 0 or less, remove the item.
     - `clearCart()`: Set `cartItems` to an empty array.
     - `getCartTotal()`: Calculate and return the total price of all items in the cart.
  4. Provide `cartItems` and these functions to child components through the context provider.

**Note:** The `CartProvider` should be placed high in the component tree, likely in `App.tsx`, to wrap all pages that need cart access.

### 3. Order API Service (`frontend/src/services/orderService.ts`)

This service encapsulates the API call to the backend for creating an order.

- **Dependencies:** Import the pre-configured Axios instance, `apiClient`, from `frontend/src/api/client.ts`. Import `CreateOrderRequest` and `RazorpayOrderResponse` from `frontend/src/types/order.ts`.

**`createOrder` function:**
- **Signature:** `createOrder(data: CreateOrderRequest): Promise<RazorpayOrderResponse>`
- **Logic:**
  1. Make a POST request to the backend endpoint `/api/v1/orders` using `apiClient.post()`.
  2. Pass the `data` object as the request body.
  3. The function should return the promise that resolves with the response data, which is expected to be of type `RazorpayOrderResponse`.
  4. Handle potential errors at the calling site (the hook).

### 4. Order Creation Hook (`frontend/src/hooks/useOrders.ts`)

This custom hook uses React Query's `useMutation` to manage the state of the order creation process (loading, error, success).

- **Dependencies:** Import `useMutation` from `@tanstack/react-query` and `createOrder` from `frontend/src/services/orderService.ts`.

**`useCreateOrder` hook:**
- **Signature:** `useCreateOrder(): UseMutationResult<RazorpayOrderResponse, Error, CreateOrderRequest>`
- **Logic:**
  1. Call `useMutation` from React Query.
  2. In the options object, set the `mutationFn` to `orderService.createOrder`.
  3. The hook returns the mutation object, which includes the `mutate` function and status flags (`isPending`, `isSuccess`, `isError`, `error`, `data`).

### 5. Checkout Page (`frontend/src/pages/OrderPage.tsx`)

This page serves as the main view for the checkout process, displaying the cart summary and the customer details form.

- **Dependencies:** `Layout` from `frontend/src/components/Layout.tsx`, `CartContext` from `frontend/src/context/CartContext.tsx`, and `CheckoutForm` from `frontend/src/components/CheckoutForm.tsx`.

**`OrderPage` component:**
- **Signature:** `OrderPage(): JSX.Element`
- **Logic:**
  1. Consume the `CartContext` to get `cartItems` and `getCartTotal`.
  2. Render the main `Layout` component.
  3. Inside the layout, display a main heading like "Checkout".
  4. If `cartItems` is empty, display a message "Your cart is empty." with a link to the menu page.
  5. If the cart has items, render a two-column layout on desktop screens (it can stack on mobile):
     - **Left Column:** Render the `<CheckoutForm />` component.
     - **Right Column (Order Summary):**
       - Display a heading "Order Summary".
       - Map over `cartItems` to display each item's name, quantity, and price.
       - Display the total price calculated by `getCartTotal()`.
       - Style this section as a card with a subtle background and border, using charcoal text (`text-[#333333]`) on an off-white background (`bg-[#f8f8f8]`).

### 6. Checkout Form Component (`frontend/src/components/CheckoutForm.tsx`)

This component is the interactive form for collecting customer details and triggering the payment flow.

- **Dependencies:** `useOrders` hook, `CartContext`, and UI components from a library like `shadcn/ui` (e.g., `Input`, `Button`, `Label`, `Textarea`).

**`CheckoutForm` component:**
- **Signature:** `CheckoutForm(): JSX.Element`
- **Logic:**
  1. **Form State:** Use `react-hook-form` to manage form state for `customerName`, `customerPhone`, and `deliveryAddress`. Implement basic validation (e.g., all fields required).
  2. **Context and Hooks:**
     - Get `cartItems` and `clearCart` from `CartContext`.
     - Call `useCreateOrder()` to get the `mutate` function and `isPending` state.
  3. **Razorpay Script:** Implement a utility or a simple `useEffect` to dynamically load the Razorpay checkout script (`https://checkout.razorpay.com/v1/checkout.js`) when the component mounts.
  4. **Form Submission (`onSubmit` handler):**
     a. Prevent default form submission.
     b. Construct the `CreateOrderRequest` payload:
        - Get customer details from the form state.
        - Map `cartItems` to the required format: `{ menuItemId: item.id, quantity: item.quantity, price: item.price }`.
     c. Call `mutate(payload, { onSuccess: handlePayment, onError: handleError })`.
  5. **Payment Handling (`handlePayment` function):**
     a. This function is the `onSuccess` callback for the mutation. It receives the `RazorpayOrderResponse` data from the backend.
     b. Create a Razorpay options object:
        ```

javascript
        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'Way Down South',
          description: 'Order Payment',
          order_id: data.razorpayOrderId,
          handler: function (response) {
            // On successful payment
            clearCart();
            // Redirect to an order confirmation/success page
            // e.g., navigate('/order-confirmation');
          },
          prefill: {
            name: customerName, // from form
            contact: customerPhone, // from form
          },
          theme: {
            color: '#d4a843', // Turmeric Yellow
          },
        };
        

```
     c. Instantiate Razorpay: `const rzp = new window.Razorpay(options);`
     d. Open the modal: `rzp.open();`
  6. **UI and Styling:**
     - Use `Label` and `Input`/`Textarea` for form fields.
     - The submit button's text should be "Place Order & Pay".
     - The button should be disabled and show a spinner when `isPending` is true.
     - Use the primary accent color for the button: `bg-[#d4a843]`.
     - Display any submission errors (`onError`) to the user.

---

## Admin Portal (Frontend)

**Name:** `admin-portal-frontend`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/services/adminMenuService.ts` — SERVICE layer — encapsulates all API calls for the admin menu management page. It provides createMenuItem, updateMenuItem, and deleteMenuItem functions that interact with the secure /api/v1/admin/menu-items endpoints.
- `frontend/src/pages/AdminMenuPage.tsx` — PAGE layer — provides the UI for menu CRUD operations. It displays menu items in a data table, with buttons for adding, editing, and deleting items. It uses useMenu to fetch data and calls adminMenuService functions for mutations.
- `frontend/src/services/adminReservationService.ts` — SERVICE layer — encapsulates API calls for the admin reservation page. It provides getReservations() and updateReservationStatus(id, status) functions that interact with the secure /api/v1/admin/reservations endpoints.
- `frontend/src/pages/AdminReservationsPage.tsx` — PAGE layer — provides the UI for managing reservations. It displays all reservations in a data table and allows the admin to change the status of each reservation (e.g., from PENDING to CONFIRMED) by calling adminReservationService.
- `frontend/src/services/adminOrderService.ts` — SERVICE layer — encapsulates API calls for the admin order dashboard. It provides getOrders() and updateOrderStatus(id, status) functions that interact with the secure /api/v1/admin/orders endpoints.
- `frontend/src/pages/AdminOrdersPage.tsx` — PAGE layer — provides the UI for managing online orders. It displays a real-time feed of incoming and existing orders in a data table and allows staff to update the order status (e.g., to PREPARING) by calling adminOrderService.

**Feature Instruction:**

This feature instruction covers the frontend implementation of the Way Down South Admin Portal, which includes three main sections: Menu Management, Reservation Management, and Order Management. Each section consists of a service file for API interactions and a page component for the UI, built with React, TypeScript, and Shadcn/UI.

All API-calling services will import and use the `apiClient` instance from `frontend/src/api/client.ts`. All page components will use `react-query` for data fetching, caching, and mutations to manage server state effectively.

For type safety, you will need to import types from `frontend/src/types/*.ts`. Assume the following structures:
- `MenuItem`: `{ id: string; name: string; description: string; price: number; category: string; imageUrl: string; }`
- `ReservationResponse`: `{ id: string; customerName: string; reservationTime: string; partySize: number; status: string; ... }`
- `OrderResponse`: `{ id: string; customerInfo: { name: string; ... }; items: any[]; totalAmount: number; status: string; orderDate: string; ... }`

### Part 1: Admin Menu Management

**1. `frontend/src/services/adminMenuService.ts`**

This service encapsulates all API calls for menu item CRUD operations. It interacts with the secure admin endpoints.

- **Imports**: Import `apiClient` from `../api/client` and `MenuItem` from `../types/menu`.

- **`createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem>`**
  1.  Make a `POST` request to `/api/v1/admin/menu-items` using `apiClient`.
  2.  Pass the `item` object as the request body.
  3.  Return the `data` from the API response.

- **`updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem>`**
  1.  Make a `PUT` request to the template literal path `/api/v1/admin/menu-items/${id}` using `apiClient`.
  2.  Pass the `item` object as the request body.
  3.  Return the `data` from the API response.

- **`deleteMenuItem(id: string): Promise<void>`**
  1.  Make a `DELETE` request to `/api/v1/admin/menu-items/${id}` using `apiClient`.
  2.  This function does not return any content.

**2. `frontend/src/pages/AdminMenuPage.tsx`**

This page provides the UI for admins to manage the restaurant's menu.

- **Component `AdminMenuPage()`**: Renders the menu management interface.
- **Data Fetching**: Use the `useMenu` hook from `frontend/src/hooks/useMenu.ts` to fetch the list of all menu items. This hook provides `data`, `isLoading`, and `error` states.
- **Mutations**: Use `react-query`'s `useMutation` hook for create, update, and delete operations.
  -   For each mutation, call the corresponding function from `adminMenuService` (`createMenuItem`, `updateMenuItem`, `deleteMenuItem`).
  -   On `onSuccess` for each mutation, invalidate the query associated with `useMenu` to trigger a refetch and update the UI.
- **UI and Layout**:
  -   The page should have a main heading: "Manage Menu".
  -   Use Shadcn/UI's `<Table>` component to display the menu items. Columns should include: Image, Name, Category, Price, and Actions.
  -   Above the table, include a `<Button>` with the text "Add New Item". This button should open a `<Dialog>` containing a form for creating a new menu item.
  -   The "Actions" column in the table should contain two buttons for each row: "Edit" and "Delete".
  -   The "Edit" button opens the same `<Dialog>` component, but pre-filled with the data of the selected menu item.
  -   The "Delete" button should trigger a Shadcn/UI `<AlertDialog>` to confirm the action before calling the delete mutation.
  -   The form inside the dialog should use `react-hook-form` and `zod` for validation, with fields for Name, Description, Price, Category, and Image URL.

### Part 2: Admin Reservation Management

**1. `frontend/src/services/adminReservationService.ts`**

This service handles fetching and updating reservation data.

- **Imports**: Import `apiClient` from `../api/client` and `ReservationResponse` from `../types/reservation`.

- **`getReservations(): Promise<ReservationResponse[]>`**
  1.  Make a `GET` request to `/api/v1/admin/reservations` using `apiClient`.
  2.  Return the `data` from the API response.

- **`updateReservationStatus(id: string, status: string): Promise<ReservationResponse>`**
  1.  Make a `PUT` request to `/api/v1/admin/reservations/${id}/status` using `apiClient`.
  2.  Send an object `{ status }` as the request body.
  3.  Return the `data` from the API response.

**2. `frontend/src/pages/AdminReservationsPage.tsx`**

This page allows admins to view and manage all customer reservations.

- **Component `AdminReservationsPage()`**: Renders the reservation management interface.
- **Data Fetching**: Use `react-query`'s `useQuery` hook to fetch reservations by calling `adminReservationService.getReservations`.
- **Mutations**: Use `useMutation` to handle status updates, calling `adminReservationService.updateReservationStatus`. On success, invalidate the reservations query.
- **UI and Layout**:
  -   The page should have a main heading: "Manage Reservations".
  -   Use a `<Table>` to display reservations. Columns: Customer Name, Contact (Email/Phone), Reservation Time, Party Size, and Status.
  -   The "Status" column for each reservation should render a Shadcn/UI `<Select>` component. The options should be "PENDING", "CONFIRMED", and "CANCELLED".
  -   When the admin changes the value of the `<Select>`, trigger the `updateReservationStatus` mutation for that specific reservation.

### Part 3: Admin Order Management

**1. `frontend/src/services/adminOrderService.ts`**

This service handles fetching and updating customer order data.

- **Imports**: Import `apiClient` from `../api/client` and `OrderResponse` from `../types/order`.

- **`getOrders(): Promise<OrderResponse[]>`**
  1.  Make a `GET` request to `/api/v1/admin/orders` using `apiClient`.
  2.  Return the `data` from the API response.

- **`updateOrderStatus(id: string, status: string): Promise<OrderResponse>`**
  1.  Make a `PUT` request to `/api/v1/admin/orders/${id}/status` using `apiClient`.
  2.  Send an object `{ status }` as the request body.
  3.  Return the `data` from the API response.

**2. `frontend/src/pages/AdminOrdersPage.tsx`**

This page provides a live dashboard for managing incoming and ongoing customer orders.

- **Component `AdminOrdersPage()`**: Renders the order management interface.
- **Data Fetching**: Use `useQuery` to call `adminOrderService.getOrders`. To ensure the data is fresh, configure a `refetchInterval` of 30 seconds (e.g., `refetchInterval: 30000`).
- **Mutations**: Use `useMutation` to handle order status updates by calling `adminOrderService.updateOrderStatus`. Invalidate the orders query on success.
- **UI and Layout**:
  -   The page should have a main heading: "Live Order Feed".
  -   Use a `<Table>` to display orders. Columns: Order ID, Customer Name, Order Time, Total Amount, and Status.
  -   The "Status" column should render a `<Select>` component with options: "PENDING", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", and "CANCELLED".
  -   Changing the select value should trigger the `updateOrderStatus` mutation for that order.
  -   Consider adding a button or icon in each row to view order details (like the list of items) in a `<Dialog>`.

---

