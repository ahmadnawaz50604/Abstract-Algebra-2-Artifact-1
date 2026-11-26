import React from 'react';
import { LayoutShell } from './components/LayoutShell.tsx';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { AbelianClassifierPage } from './pages/AbelianClassifierPage.tsx';
import { AchievementsPage } from './pages/AchievementsPage.tsx';
import { AiTutorPage } from './pages/AiTutorPage.tsx';
import { CayleyTablePage } from './pages/CayleyTablePage.tsx';
import { ChallengeArenaPage } from './pages/ChallengeArenaPage.tsx';
import { CyclicCalculatorPage } from './pages/CyclicCalculatorPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { DihedralVisualizerPage } from './pages/DihedralVisualizerPage.tsx';
import { ExerciseCentrePage } from './pages/ExerciseCentrePage.tsx';
import { FiniteAbelianPage } from './pages/FiniteAbelianPage.tsx';
import { GroupExplorerPage } from './pages/GroupExplorerPage.tsx';
import { HelpAboutPage } from './pages/HelpAboutPage.tsx';
import { InteractiveDemoLabPage } from './pages/InteractiveDemoLabPage.tsx';
import { LearnPage } from './pages/LearnPage.tsx';
import { MockExamPage } from './pages/MockExamPage.tsx';
import { PermutationLabPage } from './pages/PermutationLabPage.tsx';
import { ProgressPage } from './pages/ProgressPage.tsx';
import { RealWorldPage } from './pages/RealWorldPage.tsx';
import { RevisionCentrePage } from './pages/RevisionCentrePage.tsx';
import { SelfAssessmentPage } from './pages/SelfAssessmentPage.tsx';
import { TeacherPortalPage } from './pages/TeacherPortalPage.tsx';

const PageRouter: React.FC = () => {
  const { activeNav } = useApp();

  switch (activeNav) {
    case 'dashboard':
      return <DashboardPage />;
    case 'learn':
      return <LearnPage />;
    case 'abelian':
      return <FiniteAbelianPage />;
    case 'explorer':
      return <GroupExplorerPage />;
    case 'permutations':
      return <PermutationLabPage />;
    case 'dihedral':
      return <DihedralVisualizerPage />;
    case 'cyclic':
      return <CyclicCalculatorPage />;
    case 'classifier':
      return <AbelianClassifierPage />;
    case 'cayley':
      return <CayleyTablePage />;
    case 'demolab':
      return <InteractiveDemoLabPage />;
    case 'assessment':
      return <SelfAssessmentPage />;
    case 'mockexam':
      return <MockExamPage />;
    case 'revision':
      return <RevisionCentrePage />;
    case 'exercises':
      return <ExerciseCentrePage />;
    case 'realworld':
      return <RealWorldPage />;
    case 'challenge':
      return <ChallengeArenaPage />;
    case 'tutor':
      return <AiTutorPage />;
    case 'progress':
      return <ProgressPage />;
    case 'achievements':
      return <AchievementsPage />;
    case 'teacher':
      return <TeacherPortalPage />;
    case 'help':
      return <HelpAboutPage />;
    default:
      return <DashboardPage />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <LayoutShell>
        <PageRouter />
      </LayoutShell>
    </AppProvider>
  );
}
