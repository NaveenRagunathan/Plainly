import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Onboarding from './pages/Auth/Onboarding';

// App Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Subscribers from './pages/Subscribers/SubscriberList';
import Sequences from './pages/Sequences/SequenceList';
import SequenceEditor from './pages/Sequences/SequenceEditor';
import Broadcasts from './pages/Broadcasts/BroadcastList';
import BroadcastEditor from './pages/Broadcasts/BroadcastEditor';
import LandingPages from './pages/LandingPages/LandingPageList';
import LandingPageEditor from './pages/LandingPages/LandingPageEditor';
import Settings from './pages/Settings/Settings';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 4000,
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="onboarding" element={<Onboarding />} />

            {/* Subscribers */}
            <Route path="audience" element={<Subscribers />} />

            {/* Sequences */}
            <Route path="automations" element={<Sequences />} />
            <Route path="automations/new" element={<SequenceEditor />} />
            <Route path="automations/:id" element={<SequenceEditor />} />

            {/* Broadcasts */}
            <Route path="emails" element={<Broadcasts />} />
            <Route path="emails/new" element={<BroadcastEditor />} />
            <Route path="emails/:id" element={<BroadcastEditor />} />

            {/* Landing Pages */}
            <Route path="growth" element={<LandingPages />} />
            <Route path="growth/new" element={<LandingPageEditor />} />
            <Route path="growth/:id" element={<LandingPageEditor />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
