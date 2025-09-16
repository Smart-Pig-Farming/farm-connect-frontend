# FarmConnect Frontend Architecture

## Overview

FarmConnect is a modern React application built for precision pig farming that connects farmers, veterinarians, government experts, and administrators in a collaborative agricultural platform.

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Tailwind CSS v4 + Radix UI components
- **Icons**: Lucide React
- **Real-time Communication**: Socket.IO client
- **Notifications**: Sonner toasts
- **Development**: ESLint + Path aliases

## Project Structure

```
src/
├── components/           # React components organized by feature
│   ├── bestPractices/   # Best practices management
│   ├── discussions/     # Discussion posts and replies
│   ├── home/           # Landing page components
│   ├── layout/         # Layout components (header, sidebar, etc.)
│   ├── moderation/     # Content moderation interface
│   ├── profile/        # User profile management
│   ├── score/          # Gamification and scoring
│   ├── ui/             # Reusable UI components
│   └── usermanagement/ # Admin user management
├── store/              # Redux state management
│   ├── api/           # RTK Query API endpoints
│   ├── slices/        # Redux slices for local state
│   └── utils/         # Store utilities and helpers
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries and helpers
├── pages/             # Route components
├── types/             # TypeScript type definitions
├── utils/             # General utility functions
└── data/              # Static data and mock data
```

## Core Architecture Patterns

### 1. State Management Architecture

**Redux Store Structure:**

- `auth`: Authentication state and user data
- `ui`: UI state (modals, sidebar, theme, filters)
- `notifications`: Real-time notifications
- `api`: RTK Query cache and API state

**RTK Query APIs:**

- `authApi`: Authentication endpoints
- `userApi`: User management
- `discussionsApi`: Posts, replies, voting
- `moderationApi`: Content moderation
- `permissionsApi`: Role-based permissions
- `bestPracticesApi`: Agricultural best practices

### 2. Component Architecture

**Feature-Based Organization:**
Each feature has its own directory containing:

- Main components
- Feature-specific hooks
- Local utilities
- Type definitions

**UI Component Layer:**
Reusable components built on Radix UI primitives with consistent styling via Tailwind CSS and CVA (Class Variance Authority).

### 3. Real-time Communication

**WebSocket Integration:**

- Socket.IO client for real-time updates
- Event handlers for posts, votes, replies, notifications
- Automatic RTK Query cache invalidation
- Typing indicators and user activity tracking

## Core Modules Documentation

### API Layer (`src/store/api/`)

#### Base API (`baseApi.ts`)

- Centralized RTK Query configuration
- Cookie-based authentication
- Automatic token refresh
- CSRF protection
- Standardized error handling

```typescript
// Key features:
- Base URL computation with environment variable support
- Automatic retry logic with token refresh
- Tag-based cache invalidation
- Typed error responses
```

#### Authentication API (`authApi.ts`)

- User login/logout
- Farmer registration
- Password reset flow
- OTP verification
- Profile management

#### Discussions API (`discussionsApi.ts`)

- Infinite scroll posts with cursor-based pagination
- Post creation with media upload
- Voting system (posts and replies)
- Reply management
- Content moderation integration

#### User Management API (`userApi.ts`)

- Admin user operations (CRUD)
- User statistics
- Role and permission management
- Account verification

### State Management (`src/store/slices/`)

#### Auth Slice (`authSlice.ts`)

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Key actions:
- setCredentials: Store user data after login
- logout: Clear user session
- updateUser: Update user profile data
```

#### UI Slice (`uiSlice.ts`)

```typescript
interface UiState {
  sidebarOpen: boolean;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  theme: 'light' | 'dark';
  postFilters: PostFilters;
  notifications: Notification[];
}

// Key actions:
- Modal management (login/register)
- Theme switching
- Post filtering
- Notification handling
```

### Custom Hooks (`src/hooks/`)

#### WebSocket Hook (`useWebSocket.ts`)

Real-time communication management:

- Connection lifecycle management
- Event subscription and cleanup
- Typing indicators
- Vote synchronization
- Notification delivery

```typescript
const { socket, isConnected, castVote, startTyping } = useWebSocket({
  onPostVote: (data) => updatePostInCache(data),
  onNotification: (data) => showToast(data),
});
```

#### Infinite Scroll Hook (`useInfiniteScroll.ts`)

Cursor-based pagination for posts:

- Automatic data merging
- Filter change detection
- Loading state management
- Error handling

#### Permissions Hook (`usePermissions.ts`)

Role-based access control:

```typescript
const { hasPermission, hasAnyPermission } = usePermissions();

if (hasPermission("MANAGE:USERS")) {
  // Show admin interface
}
```

### Utility Functions (`src/lib/`, `src/utils/`)

#### Class Name Utilities (`lib/utils.ts`)

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### Post Utilities (`utils/posts.ts`)

- Pagination constants
- Tag definitions
- Post formatting helpers

### Component Patterns

#### 1. Compound Components

Many UI components follow the compound component pattern:

```typescript
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### 2. Hook-Based Logic Extraction

Business logic is extracted into custom hooks:

```typescript
function PostCard({ post }) {
  const { handleVote, isVoting } = usePostVoting(post.id);
  const { isConnected } = useWebSocket();

  return (
    <Card>
      <VoteButton onVote={handleVote} disabled={isVoting || !isConnected} />
    </Card>
  );
}
```

#### 3. Portal-Based Overlays

Modals, dropdowns, and tooltips use React portals to avoid z-index issues:

```typescript
// Dropdown content is rendered at document.body level
return ReactDOM.createPortal(menu, document.body);
```

## Data Flow

### 1. User Interactions

```
User Action → Component Handler → RTK Mutation →
API Call → Optimistic Update → WebSocket Event →
Cache Update → UI Re-render
```

### 2. Real-time Updates

```
Server Event → WebSocket → Event Handler →
RTK Query Cache Patch → Component Re-render
```

### 3. Authentication Flow

```
Login Form → authApi.login → Set HTTP-only Cookie →
Update Auth State → Redirect to Dashboard
```

## Performance Optimizations

### 1. RTK Query Caching

- Normalized cache structure
- Selective cache invalidation
- Background refetching
- Optimistic updates

### 2. Component Optimization

- React.memo for expensive components
- useMemo for computed values
- useCallback for stable references

### 3. Bundle Optimization

- Dynamic imports for code splitting
- Tree shaking for unused code
- Asset optimization via Vite

### 4. Real-time Optimization

- Debounced typing indicators
- Batched WebSocket events
- Connection retry logic

## Security Considerations

### 1. Authentication

- HTTP-only cookies for token storage
- CSRF protection via cookies
- Automatic token refresh
- Secure logout clearing

### 2. Authorization

- Role-based permission system
- Route-level protection
- Component-level access control

### 3. Data Validation

- TypeScript for type safety
- Runtime validation for API responses
- Input sanitization

## Development Workflow

### 1. Component Development

1. Create component in appropriate feature directory
2. Add TypeScript interfaces
3. Implement with Radix UI primitives
4. Style with Tailwind CSS
5. Add custom hooks for logic
6. Write tests if applicable

### 2. API Integration

1. Define types in `types/` directory
2. Create RTK Query endpoint
3. Add cache tags for invalidation
4. Implement optimistic updates
5. Handle error states

### 3. State Management

1. Identify state requirements
2. Choose between local state, RTK slice, or API cache
3. Implement actions and reducers
4. Connect to components via hooks

## Testing Strategy

### 1. Component Testing

- React Testing Library for component tests
- Mock API responses
- Test user interactions

### 2. Integration Testing

- Test complete user flows
- Mock WebSocket connections
- Test error scenarios

### 3. Type Safety

- Strict TypeScript configuration
- Runtime type checking for API responses
- Type-safe Redux usage

## Deployment Considerations

### 1. Environment Configuration

- Environment-specific API URLs
- Feature flags for development
- Build-time optimizations

### 2. Performance Monitoring

- Bundle size analysis
- Runtime performance tracking
- Error boundary implementation

### 3. Progressive Enhancement

- Offline capability considerations
- Graceful WebSocket disconnection handling
- Fallback UI states
