import { MotionConfig } from 'framer-motion';
import { Suspense, lazy, useEffect } from 'react';
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import { LoadingState } from './components/ui/StateFeedback';
import { TrainingProvider, useTraining } from './context/TrainingContext';
import { OnboardingExperience } from './features/onboarding/OnboardingExperience';

const LandingPage = lazy(() =>
  import('./features/landing/LandingPage').then((m) => ({
    default: m.LandingPage,
  })),
);
const DashboardPage = lazy(() =>
  import('./features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
);
const ProfilePage = lazy(() =>
  import('./features/profile/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  })),
);
const ReferencesPage = lazy(() =>
  import('./features/references/ReferencesPage').then((m) => ({
    default: m.ReferencesPage,
  })),
);
const CertificatesPage = lazy(() =>
  import('./features/certificates').then((m) => ({
    default: m.CertificatesPage,
  })),
);
const AcademyPage = lazy(() =>
  import('./features/academy').then((m) => ({ default: m.AcademyPage })),
);
const MissionControlPage = lazy(() =>
  import('./features/mission-control').then((m) => ({
    default: m.MissionControlPage,
  })),
);
const ZeroGravityLabPage = lazy(() =>
  import('./features/zero-gravity-lab').then((m) => ({
    default: m.ZeroGravityLabPage,
  })),
);
const SpacewalkTrainingPage = lazy(() =>
  import('./features/spacewalk-training').then((m) => ({
    default: m.SpacewalkTrainingPage,
  })),
);
const EmergencyTrainingPage = lazy(() =>
  import('./features/emergency-training').then((m) => ({
    default: m.EmergencyTrainingPage,
  })),
);
const AiMentorPage = lazy(() =>
  import('./features/ai-mentor').then((m) => ({ default: m.AiMentorPage })),
);
const NotFoundPage = lazy(() =>
  import('./features/not-found/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  })),
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function CommandDeckLayout() {
  return (
    <AppShell showSidebar={true}>
      <Outlet />
    </AppShell>
  );
}

export function AppRoutes() {
  const { cadetProfile, awaitingMissionControlEntry } = useTraining();
  const showOnboarding = !cadetProfile || awaitingMissionControlEntry;

  if (showOnboarding) {
    return (
      <>
        <ScrollToTop />
        <Suspense
          fallback={<LoadingState title="Synchronizing orbital module..." />}
        >
          <Routes>
            <Route path="/" element={<OnboardingExperience />} />
            <Route path="/dashboard" element={<OnboardingExperience />} />
            <Route path="/profile" element={<OnboardingExperience />} />
            <Route path="/certificates" element={<OnboardingExperience />} />
            <Route path="/certificates/verify" element={<OnboardingExperience />} />
            <Route path="/references" element={<OnboardingExperience />} />
            <Route path="/academy" element={<OnboardingExperience />} />
            <Route path="/mission-control" element={<OnboardingExperience />} />
            <Route path="/zero-gravity-lab" element={<OnboardingExperience />} />
            <Route path="/spacewalk-training" element={<OnboardingExperience />} />
            <Route path="/emergency-training" element={<OnboardingExperience />} />
            <Route path="/ai-mentor" element={<OnboardingExperience />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Suspense
        fallback={<LoadingState title="Synchronizing orbital module..." />}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<CommandDeckLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route
              path="/certificates/verify"
              element={<CertificatesPage initialFocusVerify />}
            />
            <Route path="/references" element={<ReferencesPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/mission-control" element={<MissionControlPage />} />
            <Route path="/zero-gravity-lab" element={<ZeroGravityLabPage />} />
            <Route path="/spacewalk-training" element={<SpacewalkTrainingPage />} />
            <Route path="/emergency-training" element={<EmergencyTrainingPage />} />
            <Route path="/ai-mentor" element={<AiMentorPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export function App() {
  return (
    <AppErrorBoundary>
      <MotionConfig reducedMotion="user">
        <TrainingProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TrainingProvider>
      </MotionConfig>
    </AppErrorBoundary>
  );
}

export default App;
