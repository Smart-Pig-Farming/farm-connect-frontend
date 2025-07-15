# Use Case Specifications for Pig Farmers Engagement Platform

This document outlines the comprehensive use case specifications for the FarmConnect platform, detailing user interactions, system behaviors, and workflows.

## Table of Contents

- [Authentication & User Management](#authentication--user-management)
- [Content Management](#content-management)
- [Community Features](#community-features)
- [Best Practices & Education](#best-practices--education)
- [Gamification](#gamification)
- [User Profile Management](#user-profile-management)

---

## Authentication & User Management

### UC-001: Register as Farmer

**Actor:** Guest  
**Brief Description:** A guest user signs up and is automatically assigned the farmer role to gain access to the platform. Additional farm-related profile fields are also collected.

**Preconditions:** User is not logged in.  
**Postconditions:** User is created with role farmer, logged in, and session token issued.

**Basic Flow:**

1. Guest opens the registration form
2. Inputs firstname, lastname, email, password, farm name, province, district, sector, and field
3. System creates a new user with role = farmer, isVerified = true
4. System logs user in, issues auth token, and redirects to homepage

---

### UC-002: Admin Manages Users

**Actor:** Admin  
**Brief Description:** Admin manages user accounts: creates users with elevated roles, updates roles, locks/unlocks users.

**Preconditions:** Admin is logged in.  
**Postconditions:** User accounts may be added, roles changed, or status locked/unlocked.

**Basic Flow:**

1. Admin accesses the user management panel
2. Admin views all users and their statuses
3. Admin creates a user (vet/govt/admin), and the system sets isVerified = false
4. System emails credentials to new user
5. Admin may toggle isLocked status for any user

**Alternative Flow A1:**

- If email sending fails, admin is notified to retry or provide alternate contact

---

### UC-003: Admin Manages Roles and Permissions

**Actor:** Admin  
**Brief Description:** Admin creates, updates, and deletes roles and permissions, and assigns roles to users.

**Preconditions:** Admin is logged in.  
**Postconditions:** Roles and permissions are updated; users may have new roles.

**Basic Flow:**

1. Admin accesses the "Role Management" interface
2. Admin creates or updates a role (e.g., name, description)
3. Admin assigns or revokes permissions from the role
4. Admin selects a user and assigns one or more roles
5. System persists all changes

**Alternative Flow A1:**

- If role name already exists, system shows validation error

**Alternative Flow A2:**

- If assigning a role to a non-existent user, system prompts for correction

---

### UC-004: First-Time Login Verification

**Actor:** New User (Vet, Govt, Admin)  
**Brief Description:** On first login, the user is required to change their password before gaining full access.

**Preconditions:** isVerified = false  
**Postconditions:** isVerified = true

**Basic Flow:**

1. User logs in with temporary credentials
2. System prompts password reset form
3. User sets and confirms a new password
4. System updates credentials and isVerified = true

---

### UC-005: Reset Password (Authenticated)

**Actor:** Authenticated User  
**Brief Description:** User updates their password while logged in.

**Preconditions:** User is authenticated.  
**Postconditions:** Password is updated.

**Basic Flow:**

1. User opens "Change Password" form
2. Inputs old password, new password, confirm new password
3. System verifies and updates the password

---

### UC-006: Forgot Password (Unauthenticated)

**Actor:** Unauthenticated User  
**Brief Description:** User resets password via email and OTP flow.

**Preconditions:** User account exists.  
**Postconditions:** Password is updated.

**Basic Flow:**

1. User clicks "Forgot Password" and enters email
2. System verifies email and sends OTP (expires in 5 mins)
3. User enters OTP
4. If verified, user sets and confirms a new password

**Alternative Flow A1:**

- User can request OTP resend if it has expired

---

### UC-007: Logout

**Actor:** Authenticated User  
**Brief Description:** User logs out from the application.

**Preconditions:** User is logged in.  
**Postconditions:** Session token is invalidated.

**Basic Flow:**

1. User clicks Logout
2. System clears token from session
3. Redirects to homepage

---

## Content Management

### UC-008: View Summary Dashboard

**Actor:** Admin  
**Brief Description:** Admin views platform-wide activity and engagement statistics.

**Preconditions:** Admin is logged in.  
**Postconditions:** Dashboard displays updated insights.

**Basic Flow:**

1. Admin opens dashboard
2. System displays:
   - Number of active users (isLocked = false)
   - Number of conversations started this week
   - Number of best practices shared this week
   - Number of market opportunities still marked as available
   - Most active users by role (based on posts/replies)
   - Pending posts or replies flagged for moderation
   - Weekly engagement trends and comparative stats

---

### UC-009: Create Post in Conversation

**Actor:** Any User  
**Brief Description:** Users create discussion posts with tags and optional media, and their content becomes visible to others.

**Preconditions:** User is logged in.  
**Postconditions:** Post is stored, broadcasted in the feed, and visible to others.

**Basic Flow:**

1. User clicks "New Post", enters title and text
2. Selects relevant tags (≥1; default: General)
3. Uploads either image (≤10MB) or video (≤512MB)
4. If tag = Market, toggles "Still Available"
5. Clicks Submit
6. System stores post with metadata and timestamp
7. Post appears in the public conversation feed for all users

**Alternative Flow A1:**

- If upload file exceeds limit, system shows error

---

### UC-010: Report Post or Reply

**Actor:** Any User  
**Brief Description:** Users can report inappropriate or harmful posts and replies for moderation.

**Preconditions:** User is logged in.  
**Postconditions:** Report is submitted and added to moderation queue.

**Basic Flow:**

1. User views a post or reply
2. Clicks "Report" button
3. Chooses a reason (e.g., offensive, spam, misleading)
4. Optionally adds comment
5. System records report and notifies moderator

---

## Community Features

### UC-011: Reply and React to Post

**Actor:** Any User  
**Brief Description:** User replies to posts and reacts via upvotes/downvotes.

**Preconditions:** User is logged in.  
**Postconditions:** Reactions and replies recorded.

**Basic Flow:**

1. User opens a post
2. Writes and submits a text reply
3. Upvotes/downvotes post or reply
4. System updates engagement metrics

---

### UC-012: Filter/Search Posts

**Actor:** Any User  
**Brief Description:** Filter conversation posts by tags or search by title.

**Preconditions:** Posts exist.  
**Postconditions:** Matching posts are displayed.

**Basic Flow:**

1. User enters search query or selects tags
2. System filters and displays matching posts

---

### UC-013: Moderate Content

**Actor:** Admin  
**Brief Description:** Admin moderates user-generated content, including processing user reports, removing content, promoting posts, or approving high-quality content.

**Preconditions:** Admin is logged in.  
**Postconditions:** Post is either removed, promoted, stamped approved, or retained with a report decision recorded.

**Basic Flow:**

1. Admin views reported content from the moderation queue
2. Admin selects one of the following actions:
   - **Remove Post:** Deletes the post and deducts 5 points from the original poster. Notifies the reporter that the report was accepted
   - **Reject Report:** Leaves the post visible and notifies the reporter that the report was rejected
   - **Stamp as Approved:** Adds a visible 'Approved by Moderator' stamp to the post and awards +5 points to the poster
3. System logs moderator action and updates post status accordingly

**Note:** Actions outside the report queue (manual review): Admin can search for any post and apply the above actions without user reports.

---

## Best Practices & Education

### UC-014: Manage Best Practices

**Actor:** Admin, Vet, Govt  
**Brief Description:** Create validated, structured educational content.

**Preconditions:** User is authorized.  
**Postconditions:** Content appears under selected categories.

**Basic Flow:**

1. Click "Create Best Practice"
2. Add title, description, steps, benefits
3. Select one or more of 8 tags (categories)
4. Attach image or video
5. Submit; system saves and categorizes

---

### UC-015: Translate Best Practice Content

**Actor:** Any User  
**Brief Description:** Users can toggle the language of best practice text between English and Kinyarwanda.

**Preconditions:** User is on the best practice content view.  
**Postconditions:** Translated version of the content is displayed or fallback is used.

**Basic Flow:**

1. User accesses a best practice entry
2. User clicks the language toggle button
3. System checks current language and sends the text content to the Google Translate API
4. Translated content is returned and displayed in the UI
5. User can toggle again to switch back to original language

**Alternative Flow A1:**

- If translation fails due to API or connectivity error, system displays original content with an error notification

---

### UC-016: Take Quiz

**Actor:** Any User  
**Brief Description:** Users validate learning via multiple-choice quizzes tied to best practice content.

**Preconditions:** Quiz questions have been created for the relevant best practice category.  
**Postconditions:** Score is recorded and displayed; optional feedback is shown.

**Basic Flow:**

1. User selects a quiz from a best practice section
2. System pulls a randomized set of 10 multiple-choice questions from the quiz bank
3. User answers all questions
4. User submits the quiz
5. System evaluates the answers and calculates the score
6. System displays the score and optional feedback (e.g., correct answers)

**Note:**

- The quiz content is created and managed by the individual who authored the best practice
- Admins and experts can also assign quizzes to best practice entries

---

### UC-017: Create Quiz for Best Practice

**Actor:** Best Practice Author (Admin, Vet, Govt)  
**Brief Description:** Allows Admin, Vet, Govt to create and manage quiz questions associated with their content.

**Preconditions:** The best practice content has already been created and published.  
**Postconditions:** A quiz with multiple-choice questions is linked to the best practice category and made available for users to attempt.

**Basic Flow:**

1. Admin, Vet, Govt access the "Quiz Management" panel for an existing best practice entry
2. Clicks "Add Quiz Questions"
3. Inputs multiple-choice questions (with four options and one correct answer per question)
4. Repeats until desired number of questions is added (minimum of 10 suggested)
5. Clicks "Save Quiz"
6. System validates and links the quiz to the best practice category
7. Quiz becomes available for users to take in the relevant section

**Alternative Flow A1:**

- If fewer than 10 questions are added, system prevents publishing and prompts for more

**Note:**

- Only the original author or an admin can modify or delete the quiz questions
- Questions can be edited or updated at any time prior to being attempted by users

---

## Gamification

### UC-018: Earn Points & Level Up

**Actor:** Any User  
**Brief Description:** Points are awarded/deducted based on engagement.

**Preconditions:** User performs any eligible action.  
**Postconditions:** Score and level updated.

**Basic Flow:**
Points are awarded as follows:

- **+5:** New post
- **+3:** Reply
- **+1:** Reaction
- **-5:** Content removed by moderation

**Levels:**

- **Amateur:** <100 points
- **Knight:** 100–199 points
- **Expert:** 200+ points

---

## User Profile Management

### UC-019: View & Edit Profile

**Actor:** Any User  
**Brief Description:** View and update personal info, password, and content.

**Preconditions:** User is logged in.  
**Postconditions:** Profile info updated.

**Basic Flow:**

1. User navigates to "My Profile"
2. Views and edits info
3. Clicks "Save Changes"
4. System updates profile

---

### UC-020: View My Posts

**Actor:** Any User  
**Brief Description:** View all personal posts with filters.

**Preconditions:** User has posted content.  
**Postconditions:** Matching posts displayed.

**Basic Flow:**

1. User navigates to "My Posts"
2. Filters by tag or searches by title
3. System displays matching results

---

## Summary

This document covers 20 comprehensive use cases that define the core functionality of the FarmConnect platform. Each use case is designed to support the platform's mission of connecting farmers, experts, and agricultural innovation through secure collaboration and knowledge sharing.

### Key System Actors:

- **Guest:** Unregistered users
- **Farmer:** Registered farmers with basic platform access
- **Vet/Govt:** Agricultural experts with content creation privileges
- **Admin:** System administrators with full platform control

### Core Platform Capabilities:

- Multi-role user management with secure authentication
- Community-driven content creation and moderation
- Expert-curated educational resources with translation support
- Gamified engagement system with points and levels
- Comprehensive admin dashboard and analytics
