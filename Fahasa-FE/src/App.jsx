// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import ProductPage from './pages/Admin/ProductPage';
// import ReportPage from './pages/Admin/ReportPage';
// import './App.css';

// function App() {
//   return (
//     <Router>
//       <div className="container mt-4">
//         {/* Thanh điều hướng (Menu) */}
//         <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 p-3 rounded">
//           <ul className="navbar-nav">
//             <li className="nav-item">
//               <Link className="nav-link" to="/"><b>Câu 3.1:</b> Quản lý Dữ liệu</Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/report"><b>Câu 3.2 & 3.3:</b> Báo cáo & Thống kê</Link>
//             </li>
//           </ul>
//         </nav>

//         {/* Nội dung thay đổi theo Route */}
//         <Routes>
//           <Route path="/" element={<ProductPage />} />
//           <Route path="/report" element={<ReportPage />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import MainLayout from './components/Layout/MainLayout';
// import HomePage from './pages/Customer/HomePage';
// // 👇 Import trang Login mới tạo
// import LoginPage from './pages/Auth/LoginPage'; 

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Route cho Khách hàng (Có Header/Footer) */}
//         <Route element={<MainLayout />}>
//           <Route path="/" element={<HomePage />} />
//           {/* ... các trang khác ... */}
//         </Route>

//         {/* Route cho Login (Nằm RIÊNG LẺ, không dính MainLayout để mất Header/Footer) */}
//         <Route path="/login" element={<LoginPage />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast-custom.css';
import AppRoutes from './routes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </AuthProvider>
  );
}

export default App;