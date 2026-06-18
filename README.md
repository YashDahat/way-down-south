# Way Down South

Auto-generated website for Way Down South — South Indian restaurant, Sr no 110, Way Down South, Sai krupa apt, 11, Baner - Mahalunge Rd, near d.mart, next to bank of baroda, Laxman Nagar, Baner, Pune, Maharashtra 411045.

## Tech Stack

- **backend**: Spring Boot 3.x + Spring Data JPA + Spring Security
- **hosting**: AWS App Runner (backend) + Vercel (frontend)
- **payment**: Razorpay
- **database**: PostgreSQL
- **frontend**: React 19 + Tailwind CSS + Shadcn/UI

## Features

- Mobile-First Responsive Design
- Online Ordering System with Razorpay Integration
- Real-time Table Reservation System
- High-Quality, Searchable Digital Menu with Images
- Structured Data (Schema.org) for Restaurant, Menu, and Reviews
- Click-to-Call and Google Maps Integration
- Order Management Dashboard for Staff

## Running Locally

```bash
docker-compose up --build
```

The app will be available at http://localhost:8080

## Development

**Backend:**
```bash
cd backend && mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```
