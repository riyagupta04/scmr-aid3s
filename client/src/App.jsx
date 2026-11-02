import { Route, Routes, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Committee from './pages/Committee.jsx';
import Submit from './pages/Submit.jsx';
import Contact from './pages/Contact.jsx';
import Login from './admin/Login.jsx';
import Dashboard from './admin/Dashboard.jsx';

function NotFound() {
  return (
    <div className="container section center">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn" to="/">
        Back to home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="conference-committee" element={<Committee />} />
        <Route path="paper-submission" element={<Submit />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
