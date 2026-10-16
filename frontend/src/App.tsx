import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AddQuestion from "./pages/AddQuestion";
import QuestionDetails from "./pages/QuestionDetails";
import EditQuestion from "./pages/EditQuestion";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="/questions/new" element={<AddQuestion />} />
       <Route path="/questions/:id/edit" element={<EditQuestion />} />
        <Route path="/questions/:id" element={<QuestionDetails />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
