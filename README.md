# FarmConnect

- **Redux Toolkit** + **RTK Query** for state & API management
- **Tailwind CSS v4** + **Radix UI** for modern styling
- **Lucide React** icons + **CVA** component variants
- **ESLint** + **Path aliases** for clean developmentect

> **Precision pig farming platform connecting farmers, experts, and agricultural innovation**

A modern web application enabling farmers to collaborate, share knowledge, access expert guidance, and build thriving agricultural communities.

## Core Features

### **Multi-Role Platform**

- **Farmers** - Register, share experiences, access resources
- **Veterinarians & Government Experts** - Share best practices, moderate content
- **Admins** - Manage users, content moderation, platform oversight

### **Community Engagement**

- **Discussion Posts** - Share experiences with tags and media
- **Best Practices Hub** - Expert-curated agricultural guidance
- **Interactive Quizzes** - Validate learning with assessments
- **Points & Levels** - Gamified engagement system
- **Content Moderation** - Community-driven quality control

### **Secure Authentication**

- Multi-step farmer registration with location mapping
- OTP-based password recovery
- Role-based access control
- Admin user management

## Tech Stack

-  **Vite** +  **React 19** +  **TypeScript**
-  **Redux Toolkit** +  **RTK Query** for state & API management
-  **Tailwind CSS v4** +  **Radix UI** for modern styling
-  **Lucide React** icons +  **CVA** component variants
-  **ESLint** +  **Path aliases** for clean development

## Project Structure

```
src/
├── store/                 # Redux & RTK Query
│   ├── api/               # RTK Query endpoints
│   ├── slices/            # Redux slices
│   └── hooks.ts           # Typed store hooks
├── components/
│   ├── home/              # Landing sections
│   └── ui/                # Reusable components
├── pages/                 # Route components
├── hooks/                 # Custom React hooks
├── data/                  # Static configurations
└── lib/                   # Utilities
```

## Quick Start

```bash
# Install & run
npm install
npm run dev

# Build for production
npm run build
```

## Key Use Cases

### **For Farmers**

- Register with farm location details
- Create discussion posts with media
- Access expert best practices
- Take educational quizzes
- Earn points through engagement

### **For Experts (Vets/Govt)**

- Share validated best practices
- Create educational quizzes
- Moderate community content
- Support farmer knowledge

### **For Admins**

- Manage user accounts & roles
- Content moderation & quality control
- Platform analytics & insights
- System administration

## State Management Architecture

```typescript
// RTK Query for API calls
const { data, isLoading } = useGetPostsQuery();

// Redux slices for local state
const user = useAppSelector((state) => state.auth.user);
const dispatch = useAppDispatch();
```

## Development Roadmap

- [ ] **Real-time Chat** - Instant farmer communication
- [ ] **Advanced Analytics** - Farm performance insights
- [ ] **Mobile App** - Native iOS/Android support
- [ ] **API Integration** - External agricultural data sources

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Use Cases](./docs/use-cases.md)** - Complete functional specifications
- **[Documentation Index](./docs/README.md)** - Full documentation overview

---

**FarmConnect** - _Empowering farmers. Enabling growth. Building the future of agriculture._
