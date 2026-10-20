import { Navigate, Route, Routes } from 'react-router-dom';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-xl">AuraWell AI</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
