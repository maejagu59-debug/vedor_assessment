import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import DashboardPage from './pages/DashboardPage'
import ReportPage from './pages/ReportPage'
import AdminPage from './pages/AdminPage'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
