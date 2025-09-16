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

- **Vite** + **React 19** + **TypeScript**
- **Redux Toolkit** + **RTK Query** for state & API management
- **Tailwind CSS v4** + **Radix UI** for modern styling
- **Lucide React** icons + **CVA** component variants
- **ESLint** + **Path aliases** for clean development

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

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9 or higher) or **yarn** (v1.22+)
- **Git** for version control
- **Modern browser** with ES2020+ support

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Smart-Pig-Farming/farm-connect-frontend.git
cd farm-connect-frontend
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Configure your environment variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api  # Backend API URL

# WebSocket Configuration
VITE_WS_URL=http://localhost:3000       # WebSocket server URL

# Application Settings
VITE_APP_NAME=FarmConnect               # Application name
VITE_APP_VERSION=1.0.0                  # Version number

# Feature Flags (optional)
VITE_ENABLE_WEBSOCKET=true              # Enable real-time features
VITE_ENABLE_NOTIFICATIONS=true          # Enable push notifications
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

The application will be available at `http://localhost:5173`

## Development Commands

### Core Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Advanced Commands

```bash
# Build with bundle analysis
npm run build -- --analyze

# Clean build artifacts
rm -rf dist node_modules/.vite

# Install dependencies and start fresh
npm ci && npm run dev
```

## Project Configuration

### Vite Configuration (`vite.config.ts`)

The project uses Vite with the following key configurations:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000", // Proxy API calls in development
    },
  },
});
```

### TypeScript Configuration

- **`tsconfig.json`**: Main TypeScript configuration
- **`tsconfig.app.json`**: Application-specific settings
- **`tsconfig.node.json`**: Node.js environment settings

### Tailwind CSS Configuration (`tailwind.config.js`)

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
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

## Testing

### Running Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

### Testing Stack

- **Unit Testing**: Vitest + React Testing Library
- **Component Testing**: Jest DOM matchers
- **API Testing**: MSW (Mock Service Worker) for API mocking
- **E2E Testing**: Playwright or Cypress (if configured)

### Writing Tests

```typescript
// Example component test
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../store";
import PostCard from "./PostCard";

test("renders post title", () => {
  render(
    <Provider store={store}>
      <PostCard post={mockPost} />
    </Provider>
  );

  expect(screen.getByText("Sample Post Title")).toBeInTheDocument();
});
```

## Deployment

### Production Build

```bash
# Create production build
npm run build

# The build output will be in the `dist/` folder
ls dist/
```

### Environment-Specific Builds

```bash
# Development build
VITE_API_URL=http://localhost:3000/api npm run build

# Staging build
VITE_API_URL=https://staging-api.farmconnect.com/api npm run build

# Production build
VITE_API_URL=https://api.farmconnect.com/api npm run build
```

### Deployment Platforms

#### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify Deployment

```bash
# Build and deploy
npm run build
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Performance Monitoring

- **Bundle Analysis**: Use `npm run build -- --analyze` to check bundle size
- **Lighthouse**: Run performance audits in Chrome DevTools
- **Web Vitals**: Monitor Core Web Vitals in production
- **Error Tracking**: Integration with Sentry or similar service

## Contributing

### Development Workflow

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/farm-connect-frontend.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** following the coding standards
5. **Test your changes**:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```
6. **Commit with conventional format**:
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request** with detailed description

### Coding Standards

#### TypeScript Guidelines

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` types - use `unknown` when needed
- Use type guards for runtime type checking

#### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Memoize expensive computations with `useMemo`
- Use `useCallback` for stable function references

#### State Management

- Use RTK Query for server state
- Use Redux Toolkit for complex local state
- Prefer local component state for simple UI state
- Implement optimistic updates where appropriate

#### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS custom properties for theme variables
- Maintain consistent spacing and typography

#### Git Conventions

- Use conventional commit messages:
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `docs:` - Documentation changes
  - `style:` - Code style changes
  - `refactor:` - Code refactoring
  - `test:` - Test additions/changes
  - `chore:` - Build process changes

### Code Review Process

1. **Automated Checks**: Ensure all CI checks pass
2. **Code Quality**: Review for adherence to coding standards
3. **Testing**: Verify adequate test coverage
4. **Performance**: Check for potential performance impacts
5. **Security**: Review for security vulnerabilities
6. **Documentation**: Ensure changes are properly documented

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# If port 5173 is busy, specify a different port
npm run dev -- --port 3001
```

#### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Restart TypeScript server in VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

#### Build Failures

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

### Performance Optimization

#### Development Mode

- Enable React Developer Tools for debugging
- Use Chrome DevTools Performance tab for profiling
- Monitor bundle size with `npm run build -- --analyze`

#### Production Mode

- Ensure proper tree shaking by avoiding `import *`
- Use dynamic imports for code splitting
- Optimize images and assets in `public/` folder

## Backend Integration

### API Server Setup

The frontend requires the FarmConnect backend API server:

1. **Clone Backend Repository**

   ```bash
   git clone https://github.com/Smart-Pig-Farming/farm-connect-backend.git
   ```

2. **Start Backend Services**

   ```bash
   cd farm-connect-backend
   npm install
   npm run dev  # Usually runs on http://localhost:3000
   ```

3. **Database Setup**
   - Ensure PostgreSQL is running
   - Run database migrations
   - Seed initial data

### WebSocket Configuration

Real-time features require WebSocket connection:

```javascript
// Socket.IO client configuration
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  timeout: 20000,
});
```

## Architecture Overview

### State Management Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │───▶│   RTK Query      │───▶│   Backend API   │
│                 │    │   (API Cache)    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         └─────────────▶│  Redux Store     │◀────────────┘
                        │  (Local State)   │
                        └──────────────────┘
                                 │
                        ┌──────────────────┐
                        │   WebSocket      │
                        │  (Real-time)     │
                        └──────────────────┘
```

### Component Architecture

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives
│   ├── discussions/     # Feature-specific components
│   ├── moderation/      # Admin/moderation interface
│   └── usermanagement/  # User administration
├── store/
│   ├── api/            # RTK Query endpoints
│   └── slices/         # Local state management
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

### Data Flow Patterns

1. **User Interactions**: Component → Hook → RTK Mutation → API
2. **Real-time Updates**: WebSocket → Event Handler → Cache Update → Re-render
3. **Authentication**: Login → HTTP-only Cookie → Auto-refresh → Protected Routes

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Architecture](./docs/ARCHITECTURE.md)** - System design and patterns
- **[API Documentation](./docs/API.md)** - RTK Query endpoints and usage
- **[Functions](./docs/FUNCTIONS.md)** - Core function documentation
- **[Use Cases](./docs/use-cases.md)** - Complete functional specifications
- **[Component Guide](./docs/COMPONENTS.md)** - Component usage examples

---

**FarmConnect** - _Empowering farmers. Enabling growth. Building the future of agriculture._
