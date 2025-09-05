import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

const HomePage = (): ReactElement => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="homepage-hero">
        {/* Background Pattern */}
        <div className="homepage-bg-overlay">
          <div className="homepage-bg-pattern"></div>
        </div>

        {/* Main Content */}
        <div className="homepage-content">
          {/* Header */}
          <div className="homepage-header">
            <h1 className="homepage-title">Fullstack Monorepo Template</h1>
            <p className="homepage-subtitle">
              Готовый шаблон для создания полноценных веб-приложений. React + NestJS + PostgreSQL в едином монорепо.
            </p>
            <div className="homepage-actions">
              <Link to="/dashboard" className="homepage-button homepage-button-primary">
                Начать работу
              </Link>
              <Link to="/widgets" className="homepage-button homepage-button-secondary">
                Демо виджеты
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="homepage-features-grid">
            <div className="homepage-feature-card">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="homepage-feature-title">Монорепо архитектура</h3>
              <p className="homepage-feature-desc">
                Единая кодовая база для фронтенда и бэкенда с pnpm workspaces
              </p>
            </div>

            <div className="homepage-feature-card">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="homepage-feature-title">Готовые технологии</h3>
              <p className="homepage-feature-desc">
                React + TypeScript + Vite, NestJS + Prisma, PostgreSQL, Docker
              </p>
            </div>

            <div className="homepage-feature-card">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="homepage-feature-title">Гибкая настройка</h3>
              <p className="homepage-feature-desc">
                Легко адаптируйте под свои нужды и добавляйте новые функции
              </p>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="homepage-nav-grid">
            <Link to="/dashboard" className="homepage-nav-card">
              <div className="text-center">
                <div className="homepage-icon-bg homepage-icon-bg-purple">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Dashboard</h3>
                <p className="text-sm text-gray-300">Главная панель</p>
              </div>
            </Link>

            <Link to="/widgets" className="homepage-nav-card homepage-nav-card-blue">
              <div className="text-center">
                <div className="homepage-icon-bg homepage-icon-bg-blue">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Виджеты</h3>
                <p className="text-sm text-gray-300">Демо функционал</p>
              </div>
            </Link>

            <Link to="/create-card" className="homepage-nav-card homepage-nav-card-green">
              <div className="text-center">
                <div className="homepage-icon-bg homepage-icon-bg-green">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Создать карточку</h3>
                <p className="text-sm text-gray-300">Пример CRUD</p>
              </div>
            </Link>

            <Link to="/login" className="homepage-nav-card homepage-nav-card-orange">
              <div className="text-center">
                <div className="homepage-icon-bg homepage-icon-bg-orange">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Войти</h3>
                <p className="text-sm text-gray-300">Авторизация</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="homepage-footer">
        <p className="homepage-footer-text">© 2025 Fullstack Monorepo Template. Created with ❤️ for developers.</p>
      </div>
    </div>
  )
}

export default HomePage
