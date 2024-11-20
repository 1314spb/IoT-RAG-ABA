// src/layouts/MainLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const servicesRef = useRef(null);
  const userRef = useRef(null);

  const location = useLocation(); // 使用 useLocation 監聽路由變化

  // 點擊外部時關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 當路由變更時，關閉所有下拉菜單
  useEffect(() => {
    setServicesDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 固定頂部導航欄 */}
      <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          {/* 網站標誌 */}
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
            <span className="text-xl font-bold">ABA</span>
          </Link>

          {/* 漢堡菜單按鈕（響應式） */}
          <button
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded={servicesDropdownOpen}
            onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>

          {/* 導航連結 */}
          <div className={`${servicesDropdownOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 md:mt-0 md:flex-row md:space-x-8">
              <li>
                <Link to="/" className="block py-2 px-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white">Home</Link>
              </li>
              
              {/* 將 Services 修改為下拉菜單按鈕 */}
              <li className="relative" ref={servicesRef}>
                <button
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500 dark:hover:bg-gray-700"
                  aria-haspopup="true"
                  aria-expanded={servicesDropdownOpen}
                >
                  Services
                  <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                {/* 下拉菜單 */}
                {servicesDropdownOpen && (
                  <ul className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-700 dark:border-gray-600">
                    <li>
                      <Link to="/services/history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Student History</Link>
                    </li>
                    <li>
                      <Link to="/services/therapy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Therapy</Link>
                    </li>
                    <li>
                      <Link to="/services/analysis" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Analysis</Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <Link to="/contact" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500 dark:hover:bg-gray-700">Contact</Link>
              </li>
            </ul>
          </div>

          {/* 用戶下拉菜單 */}
          <div className="relative ml-4" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
              id="user-menu-button"
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
            >
              <span className="sr-only">Open user menu</span>
              {/* 用戶圖標 */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 18.75c0-3.418 2.757-6.175 6.175-6.75h1.65A6.175 6.175 0 0119.5 18.75v.75h-15v-.75z" />
              </svg>
            </button>

            {/* 用戶下拉菜單內容 */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-35 bg-white rounded-md shadow-lg py-1 z-50 dark:bg-gray-700">
                <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Dashboard</Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Settings</Link>
                <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Sign out</Link>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* 主內容區域，添加上邊距以避免被固定的導航欄遮蓋 */}
      <div className="flex-grow pt-16">
        <Outlet />
      </div>

      {/* 選擇性：如果需要頁腳，可以在這裡添加 */}
      {/* <footer className="bg-gray-800 text-white py-4 text-center">
        © 2023 我的網站. 版權所有.
      </footer> */}
    </div>
  );
};

export default MainLayout;