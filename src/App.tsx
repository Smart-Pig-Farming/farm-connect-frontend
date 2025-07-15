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

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
