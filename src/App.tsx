import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './components/screens/Home';
import Courses from './components/screens/Courses';
import ScheduleCalendar from './components/screens/ScheduleCalendar';
import Profile from './components/screens/Profile';
import NotificationsScreen from './components/screens/NotificationsScreen';
import FFTCourseDetails from './components/screens/FFTCourseDetails';
import ODACourseDetails from './components/screens/ODACourseDetails';
import EmailConfirmation from './components/screens/EmailConfirmation';
import PasswordReset from './components/screens/PasswordReset';
import ThemeToggle from './components/ThemeToggle';
import { LOGO_PATH } from './utils/paths';
import AnatomyCourseDetails from './components/screens/AnatomyCourseDetails';

function App() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [activeScreen, setActiveScreen] = useState<'home' | 'courses' | 'schedule' | 'profile' | 'email-confirmation' | 'password-reset' | 'notifications' | 'fft-course' | 'oda-course' | 'anatomy-course'>(() => {
    // Восстанавливаем активный экран из localStorage
    const savedScreen = localStorage.getItem('irfit_active_screen');
    return (savedScreen as 'home' | 'courses' | 'schedule' | 'profile' | 'email-confirmation' | 'password-reset' | 'notifications' | 'fft-course' | 'oda-course' | 'anatomy-course') || 'home';
  });


  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для экрана подтверждения Email
  const [emailConfirmationData, setEmailConfirmationData] = useState<{
    email: string;
    onConfirm: (code: string) => Promise<void>;
    onResend: (code: string) => Promise<void>;
    onBack: () => void;
  } | null>(null);

  // Функция для принудительного перехода к экрану входа
  const forceGoToLogin = (confirmedEmail?: string) => {
    setActiveScreen('profile');
    setEmailConfirmationData(null);
    localStorage.setItem('irfit_active_screen', 'profile');
    // Сохраняем подтвержденный email для автозаполнения формы входа
    if (confirmedEmail) {
      localStorage.setItem('irfit_confirmed_email', confirmedEmail);
    }
  };

  // Функция для перехода к экрану восстановления пароля
  const goToPasswordReset = () => {
    setActiveScreen('password-reset');
    localStorage.setItem('irfit_active_screen', 'password-reset');
  };

  useEffect(() => {
    console.log('App component mounted');
    setIsLoading(false);
  }, []);

  // Сохраняем активный экран в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('irfit_active_screen', activeScreen);
    }, [activeScreen]);

  // Блокируем скролл body при открытых модалках
  useEffect(() => {
    const isModalOpen = activeScreen === 'email-confirmation' || activeScreen === 'password-reset';
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeScreen]);
 
  // Слушаем изменения в localStorage для обновления активного экрана
  useEffect(() => {
    const handleStorageChange = () => {
      const savedScreen = localStorage.getItem('irfit_active_screen');
      if (savedScreen && savedScreen !== activeScreen) {
        setActiveScreen(savedScreen as 'home' | 'courses' | 'schedule' | 'profile' | 'email-confirmation');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeScreen]);

  const renderScreen = () => {
    
    // Определяем основной экран
    let mainScreen;
    switch (activeScreen) {
      case 'home':
        mainScreen = <Home />;
        break;
      case 'courses':
        mainScreen = <Courses 
          onNavigateToFFT={() => setActiveScreen('fft-course')}
          onNavigateToODA={() => setActiveScreen('oda-course')}
          onNavigateToAnatomy={() => setActiveScreen('anatomy-course')}
        />;
        break;
      case 'schedule':
        mainScreen = <ScheduleCalendar />;
        break;
      case 'profile':
        mainScreen = <Profile 
          onShowEmailConfirmation={(data) => {
            setEmailConfirmationData(data);
            setActiveScreen('email-confirmation');
          }}
          onForceGoToLogin={forceGoToLogin}
          onGoToPasswordReset={goToPasswordReset}
        />;
        break;
      case 'notifications':
        mainScreen = <NotificationsScreen 
          onBack={() => setActiveScreen('profile')}
          isDark={isDark}
        />;
        break;
      case 'fft-course':
        mainScreen = <FFTCourseDetails 
          onBack={() => setActiveScreen('courses')}
          isDark={isDark}
        />;
        break;
      case 'oda-course':
        mainScreen = <ODACourseDetails
          onBack={() => setActiveScreen('courses')}
        />;
        break;
      case 'anatomy-course':
        mainScreen = <AnatomyCourseDetails
          onBack={() => setActiveScreen('courses')}
        />;
        break;
      default:
        mainScreen = <Home />;
    }

    // Если активен экран подтверждения или восстановления, показываем модальное окно поверх основного
    if (activeScreen === 'email-confirmation' && emailConfirmationData) {
      return (
        <>
          {mainScreen}
          <EmailConfirmation
            email={emailConfirmationData.email}
            onConfirm={emailConfirmationData.onConfirm}
            onResend={emailConfirmationData.onResend}
            onBack={() => {
              setActiveScreen('profile');
            }}
            isLoading={false}
          />
        </>
      );
    }

    if (activeScreen === 'password-reset') {
      return (
        <>
          <Profile 
            onShowEmailConfirmation={(data) => {
              setEmailConfirmationData(data);
              setActiveScreen('email-confirmation');
            }}
            onForceGoToLogin={forceGoToLogin}
            onGoToPasswordReset={goToPasswordReset}
          />
          <PasswordReset onBack={() => setActiveScreen('profile')} />
        </>
      );
    }

    return mainScreen;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-orange-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка IRFIT APP...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-purple-50 via-orange-50 to-blue-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-md shadow-sm sticky top-0 z-40 transition-colors duration-300 ${
        isDark ? 'bg-gray-900/80' : 'bg-white/80'
      }`}>
        <div className="max-w-md mx-auto px-4 py-4 md:max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#94c356] shadow-lg">
                <img 
                  src={LOGO_PATH} 
                  alt="IRFit Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#94c356] to-[#7ba045] bg-clip-text text-transparent">
                IRFIT
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* Кнопка уведомлений */}
              {user && (
                <button
                  onClick={() => setActiveScreen('notifications')}
                  className={`p-2 rounded-lg transition-colors duration-200 w-10 h-10 flex items-center justify-center ${
                    isDark 
                      ? 'text-white hover:bg-gray-800 hover:text-[#94c356]' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#94c356]'
                  }`}
                  title="Уведомления"
                >
                  <div className="relative">
                    <span className="text-xs">🔔</span>
                    {/* Индикатор непрочитанных уведомлений */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-8">
        {renderScreen()}
      </main>

      {/* Bottom Navigation - всегда видна */}
      <Navigation activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      

    </div>
  );
}

export default App;