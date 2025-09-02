import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  HomePage,
  JoinUsPage,
  SignInPage,
  VerificationPage,
  ForgotPasswordPage,
  OTPVerificationPage,
  PasswordResetPage,
} from "@/pages";
import {
  DashboardOverviewPage,
  BestPracticesPage,
  DiscussionsPage,
  ProfilePage,
  UserManagementPage,
} from "@/pages/dashboard";
import { PracticeDetailsPage } from "@/pages/dashboard/PracticeDetailsPage";
import { PracticeListPage } from "@/pages/dashboard/PracticeListPage";
import { QuizNavPage } from "@/pages/dashboard/QuizNavPage";
import { QuestionBankPage } from "@/pages/dashboard/QuestionBankPage";
import { QuizIntroPage } from "@/pages/dashboard/QuizIntroPage";
import { LiveQuizPage } from "@/pages/dashboard/LiveQuizPage";
import { QuizAttemptReviewPage } from "@/pages/dashboard/QuizAttemptReviewPage";
import { DashboardLayout, ProtectedRoute } from "@/components/layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/join" element={<JoinUsPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/forgot-password/verify"
          element={<OTPVerificationPage />}
        />
        <Route path="/forgot-password/reset" element={<PasswordResetPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardOverviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/overview"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardOverviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/best-practices"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BestPracticesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/best-practices/:practiceId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PracticeDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/best-practices/category/:categoryKey"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PracticeListPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/best-practices/category/:categoryKey/quiz"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizNavPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/best-practices/category/:categoryKey/quiz/question-bank"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuestionBankPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/best-practices/category/:categoryKey/quiz/start"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizIntroPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/best-practices/category/:categoryKey/quiz/live"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LiveQuizPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/best-practices/category/:categoryKey/quiz/review/:quizId/:attemptId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizAttemptReviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/discussions"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DiscussionsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
