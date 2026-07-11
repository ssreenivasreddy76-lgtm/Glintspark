import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalLayout from './layouts/GlobalLayout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
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
import CurriculumDetail from './pages/CurriculumDetail';
import LessonDetail from './pages/LessonDetail';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Solutions from './pages/Solutions';
import Resources from './pages/Resources';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<GlobalLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/curriculum/:topic" element={<CurriculumDetail />} />
          <Route path="/curriculum/:topic/lesson/:lessonId" element={<LessonDetail />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/track/:topic" element={<Challenges />} />
          <Route path="/challenges/:id" element={<ChallengeIDE />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/create" element={<CreateContest />} />
          <Route path="/contests/:id" element={<ContestDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/scoring-rules" element={<ScoringRules />} />
          <Route path="/company" element={<CompanyDashboard />} />
<Route path="/mock-interview/:type" element={<MockInterviewRoom />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        {/* Auth Route outside layout for a full-screen dedicated experience */}
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
