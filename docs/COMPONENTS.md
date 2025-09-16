# Component Documentation

## Overview

This document provides comprehensive documentation for the key components in the FarmConnect application, including usage examples, props interfaces, and best practices.

## UI Components (`src/components/ui/`)

### Button Component

A flexible button component built on Radix UI primitives with consistent styling.

#### Usage

```typescript
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>;
```

#### Props

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Variants

- `primary`: Blue background, white text
- `secondary`: Gray background, dark text
- `outline`: Transparent background, colored border
- `ghost`: Transparent background, no border
- `destructive`: Red background, white text

### Card Component

A container component for grouping related content.

#### Usage

```typescript
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

### Dropdown Menu

A portal-based dropdown menu that avoids z-index issues.

#### Usage

```typescript
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem onClick={handleEdit}>
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

#### Props

```typescript
interface DropdownMenuContentProps {
  align?: "start" | "center" | "end";
  className?: string;
  children: React.ReactNode;
}
```

### Modal Component

A reusable modal component with backdrop and keyboard handling.

#### Usage

```typescript
import { Modal } from "@/components/ui/modal";

<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">
  <p>Modal content</p>
</Modal>;
```

#### Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}
```

### Input Component

A styled input component with validation states.

#### Usage

```typescript
import { Input } from "@/components/ui/input";

<Input
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={error}
  required
/>;
```

#### Props

```typescript
interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "password" | "number";
}
```

## Discussion Components (`src/components/discussions/`)

### DiscussionCard

Displays a discussion post with voting, replies, and actions.

#### Usage

```typescript
import { DiscussionCard } from "@/components/discussions/DiscussionCard";

<DiscussionCard
  post={post}
  onVote={handleVote}
  onReply={handleReply}
  onEdit={handleEdit}
  currentUserId={userId}
/>;
```

#### Props

```typescript
interface DiscussionCardProps {
  post: Post;
  onVote?: (postId: string, voteType: "up" | "down") => void;
  onReply?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  currentUserId?: number;
  showFullContent?: boolean;
}
```

#### Features

- **Voting System**: Upvote/downvote with real-time updates
- **Media Display**: Images and videos with lightbox
- **Tag Display**: Colored tags with filtering
- **Action Menu**: Edit/delete for post owners
- **Responsive Design**: Mobile-optimized layout

### RepliesSection

Manages replies display and interactions with nested threading.

#### Usage

```typescript
import { RepliesSection } from "@/components/discussions/RepliesSection";

<RepliesSection
  postId={post.id}
  isOpen={isRepliesOpen}
  onToggle={setIsRepliesOpen}
  authUserId={currentUser?.id}
/>;
```

#### Props

```typescript
interface RepliesSectionProps {
  postId: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  authUserId?: number;
  onVoteReply?: (replyId: string, voteType: "up" | "down") => void;
}
```

#### Features

- **Nested Replies**: Support for reply threading
- **Real-time Updates**: WebSocket integration for live updates
- **Optimistic UI**: Immediate feedback for user actions
- **Infinite Scroll**: Load more replies on demand
- **Reply Composition**: Inline reply creation with rich text

### CreatePostModal

Modal for creating new discussion posts with media upload.

#### Usage

```typescript
import { CreatePostModal } from "@/components/discussions/CreatePostModal";

<CreatePostModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onPostCreated={handlePostCreated}
/>;
```

#### Props

```typescript
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: Post) => void;
  initialData?: Partial<CreatePostData>;
}
```

#### Features

- **Rich Text Editor**: Markdown support with preview
- **Media Upload**: Drag-and-drop file upload with progress
- **Tag Management**: Tag selection and creation
- **Draft Persistence**: Auto-save drafts to localStorage
- **Validation**: Form validation with error messages

### EditPostModal

Modal for editing existing posts with change tracking.

#### Usage

```typescript
import { EditPostModal } from "@/components/discussions/EditPostModal";

<EditPostModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  post={selectedPost}
  onPostUpdated={handlePostUpdated}
/>;
```

## Best Practices Components (`src/components/bestPractices/`)

### BestPracticeCard

Displays agricultural best practice content with structured format.

#### Usage

```typescript
import { BestPracticeCard } from "@/components/bestPractices/BestPracticeCard";

<BestPracticeCard
  practice={bestPractice}
  onView={handleView}
  onEdit={handleEdit}
  isOwner={isOwner}
/>;
```

#### Props

```typescript
interface BestPracticeCardProps {
  practice: BestPractice;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isOwner?: boolean;
  showFullContent?: boolean;
}
```

### CategoryGrid

Grid layout for browsing best practices by category.

#### Usage

```typescript
import { CategoryGrid } from "@/components/bestPractices/CategoryGrid";

<CategoryGrid
  categories={categories}
  selectedCategory={selectedCategory}
  onCategorySelect={setSelectedCategory}
/>;
```

### ContentWizard

Step-by-step wizard for creating best practice content.

#### Usage

```typescript
import { ContentWizard } from "@/components/bestPractices/ContentWizard";

<ContentWizard
  isOpen={isWizardOpen}
  onClose={() => setIsWizardOpen(false)}
  onComplete={handleWizardComplete}
  initialData={draftData}
/>;
```

## User Management Components (`src/components/usermanagement/`)

### UsersTable

Administrative table for managing users with filters and actions.

#### Usage

```typescript
import { UsersTable } from "@/components/usermanagement/UsersTable";

<UsersTable
  users={users}
  onEdit={handleEditUser}
  onDelete={handleDeleteUser}
  onToggleLock={handleToggleLock}
  currentUser={currentUser}
/>;
```

#### Props

```typescript
interface UsersTableProps {
  users: User[];
  onEdit?: (userId: number) => void;
  onDelete?: (userId: number) => void;
  onToggleLock?: (userId: number) => void;
  onVerify?: (userId: number) => void;
  currentUser?: User;
  isLoading?: boolean;
}
```

#### Features

- **Sortable Columns**: Click headers to sort by different fields
- **Filter Controls**: Search, status, and role filtering
- **Bulk Actions**: Select multiple users for batch operations
- **Status Indicators**: Visual status badges for user states
- **Permission Checks**: Actions based on user permissions

### CreateUserModal

Modal for creating new user accounts with role assignment.

#### Usage

```typescript
import { CreateUserModal } from "@/components/usermanagement/CreateUserModal";

<CreateUserModal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onUserCreated={handleUserCreated}
  availableRoles={roles}
/>;
```

## Moderation Components (`src/components/moderation/`)

### ModerationQueue

Interface for reviewing and moderating reported content.

#### Usage

```typescript
import { ModerationQueue } from "@/components/moderation/ModerationQueue";

<ModerationQueue
  reports={pendingReports}
  onApprove={handleApprove}
  onReject={handleReject}
  onViewDetails={handleViewDetails}
/>;
```

#### Props

```typescript
interface ModerationQueueProps {
  reports: ModerationReport[];
  onApprove?: (reportId: string, reason?: string) => void;
  onReject?: (reportId: string, reason: string) => void;
  onViewDetails?: (reportId: string) => void;
  isLoading?: boolean;
}
```

### ReportModal

Modal for submitting content reports with categorization.

#### Usage

```typescript
import { ReportModal } from "@/components/moderation/ReportModal";

<ReportModal
  isOpen={isReportModalOpen}
  onClose={() => setIsReportModalOpen(false)}
  contentId={contentId}
  contentType="post"
  onReportSubmitted={handleReportSubmitted}
/>;
```

## Layout Components (`src/components/layout/`)

### Header

Main application header with navigation and user menu.

#### Usage

```typescript
import { Header } from "@/components/layout/Header";

<Header
  user={currentUser}
  onLogin={handleLogin}
  onLogout={handleLogout}
  notifications={notifications}
/>;
```

#### Props

```typescript
interface HeaderProps {
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
  notifications?: Notification[];
  unreadCount?: number;
}
```

### Sidebar

Collapsible sidebar navigation with route highlighting.

#### Usage

```typescript
import { Sidebar } from "@/components/layout/Sidebar";

<Sidebar
  isOpen={sidebarOpen}
  onToggle={setSidebarOpen}
  user={currentUser}
  activeRoute={currentRoute}
/>;
```

### Layout

Main layout wrapper that combines header, sidebar, and content.

#### Usage

```typescript
import { Layout } from "@/components/layout/Layout";

<Layout>
  <YourPageContent />
</Layout>;
```

## Component Patterns

### Higher-Order Components (HOCs)

#### withPermissions HOC

```typescript
import { withPermissions } from "@/components/hoc/withPermissions";

const AdminOnlyComponent = withPermissions(["MANAGE:USERS"], ({ children }) => (
  <div>{children}</div>
));
```

#### withLoading HOC

```typescript
import { withLoading } from "@/components/hoc/withLoading";

const LoadableComponent = withLoading(MyComponent);

<LoadableComponent isLoading={isLoading} data={data} />;
```

### Render Props Pattern

#### DataFetcher Component

```typescript
import { DataFetcher } from "@/components/common/DataFetcher";

<DataFetcher
  query={useGetPostsQuery}
  queryArgs={{ tags: ["health"] }}
  render={({ data, isLoading, error }) => (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {data && <PostsList posts={data.posts} />}
    </div>
  )}
/>;
```

### Compound Components

#### Tabs Component

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="posts">
  <TabsList>
    <TabsTrigger value="posts">Posts</TabsTrigger>
    <TabsTrigger value="practices">Best Practices</TabsTrigger>
  </TabsList>
  <TabsContent value="posts">
    <PostsList />
  </TabsContent>
  <TabsContent value="practices">
    <BestPracticesList />
  </TabsContent>
</Tabs>;
```

## Component Testing

### Testing UI Components

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  test("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("shows loading state", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Testing Components with Redux

```typescript
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { DiscussionCard } from "@/components/discussions/DiscussionCard";

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      // ... other reducers
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  initialState = {}
) => {
  const store = createTestStore(initialState);
  return render(<Provider store={store}>{component}</Provider>);
};

test("renders discussion card with user data", () => {
  renderWithProviders(<DiscussionCard post={mockPost} />, {
    auth: { user: mockUser, isAuthenticated: true },
  });

  expect(screen.getByText(mockPost.title)).toBeInTheDocument();
});
```

## Performance Optimization

### Memoization

```typescript
import React, { memo, useMemo, useCallback } from "react";

const ExpensiveComponent = memo(({ data, onItemClick }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      computedValue: expensiveCalculation(item),
    }));
  }, [data]);

  // Memoize callbacks to prevent child re-renders
  const handleClick = useCallback(
    (id: string) => {
      onItemClick(id);
    },
    [onItemClick]
  );

  return (
    <div>
      {processedData.map((item) => (
        <Item key={item.id} data={item} onClick={handleClick} />
      ))}
    </div>
  );
});
```

### Lazy Loading

```typescript
import { lazy, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

// Lazy load heavy components
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

### Virtual Scrolling

For large lists, consider virtual scrolling:

```typescript
import { FixedSizeList as List } from "react-window";

const VirtualizedList = ({ items }) => (
  <List height={400} itemCount={items.length} itemSize={80} itemData={items}>
    {({ index, style, data }) => (
      <div style={style}>
        <PostCard post={data[index]} />
      </div>
    )}
  </List>
);
```

## Best Practices

### Component Organization

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Use composition to build complex UIs
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Default Props**: Provide sensible defaults for optional props

### State Management

1. **Local State First**: Use local state for simple UI state
2. **Lift State Up**: Share state at the lowest common ancestor
3. **Global State**: Use Redux for complex shared state
4. **Server State**: Use RTK Query for server-side state

### Styling

1. **Utility First**: Use Tailwind CSS utility classes
2. **Component Variants**: Use CVA for component variations
3. **Responsive Design**: Mobile-first responsive approach
4. **Consistent Spacing**: Use design system spacing tokens

### Error Handling

1. **Error Boundaries**: Wrap components in error boundaries
2. **Graceful Degradation**: Provide fallback UI for errors
3. **User Feedback**: Show meaningful error messages
4. **Recovery Actions**: Provide ways to recover from errors

### Accessibility

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Add ARIA attributes where needed
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Screen Readers**: Test with screen reader tools
5. **Color Contrast**: Maintain adequate color contrast ratios
