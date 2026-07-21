import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalLayout from './layouts/GlobalLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import { DeveloperOnboarding } from './pages/DeveloperOnboarding';
import Dashboard from './pages/Dashboard';
import Curriculum from './pages/Curriculum';
import Admin from './pages/Admin';
import Leaderboard from './pages/Leaderboard';
import ScoringRules from './pages/ScoringRules';
import Challenges from './pages/Challenges';
import ChallengeIDE from './pages/ChallengeIDE';
import Contests from './pages/Contests';
import CreateContest from './pages/CreateContest';
import ContestDashboard from './pages/ContestDashboard';
import MockInterviewRoom from './pages/MockInterviewRoom';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyProfile from './pages/CompanyProfile';
import CurriculumDetail from './pages/CurriculumDetail';
import LessonDetail from './pages/LessonDetail';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Solutions from './pages/Solutions';
import Resources from './pages/Resources';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Practice from './pages/Practice';
import Quizzes from './pages/Quizzes';
import QuizPlayer from './pages/QuizPlayer';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<GlobalLayout />}>
          <Route path="/" element={<Landing />} />
          {/* Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><DeveloperOnboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/curriculum" element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
          <Route path="/curriculum/:topic" element={<ProtectedRoute><CurriculumDetail /></ProtectedRoute>} />
          <Route path="/curriculum/:topic/lesson/:lessonId" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
          <Route path="/challenges" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
          <Route path="/challenges/track/:topic" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
          <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeIDE /></ProtectedRoute>} />
          <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
          <Route path="/contests/create" element={<ProtectedRoute><CreateContest /></ProtectedRoute>} />
          <Route path="/contests/:id" element={<ProtectedRoute><ContestDashboard /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/company" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
          <Route path="/mock-interview/:type" element={<ProtectedRoute><MockInterviewRoom /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
          <Route path="/quizzes/:id" element={<ProtectedRoute><QuizPlayer /></ProtectedRoute>} />
          {/* Public Pages */}
          <Route path="/products" element={<Products />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/scoring-rules" element={<ScoringRules />} />
        </Route>
        {/* Auth Route outside layout for a full-screen dedicated experience */}
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
