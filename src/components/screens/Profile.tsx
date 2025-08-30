import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Coins, Trophy, Target, Calendar, Settings, LogOut, Crown, GraduationCap, Users, ChevronRight, UserPlus, History, MessageSquare } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSettings from './ProfileSettings';
import TeacherRequests from './TeacherRequests';
import ScheduleHistory from './ScheduleHistory';
import TeacherRequestForm from './TeacherRequestForm';
import EventsManagement from './EventsManagement';
import NewsManagement from './NewsManagement';
import UserMessages from './UserMessages';
import CourseApplications from './CourseApplications';

interface ProfileProps {
  onShowEmailConfirmation: (data: {
    email: string;
    onConfirm: (code: string) => Promise<void>;
    onResend: (code: string) => Promise<void>;
    onBack: () => void;
  }) => void;
  onForceGoToLogin: (confirmedEmail?: string) => void;
  onGoToPasswordReset: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onShowEmailConfirmation, onForceGoToLogin, onGoToPasswordReset }) => {
  const { isDark } = useTheme();
  const { user, isAuthenticated, logout, updateUserFromToken } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    name: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showTeacherRequests, setShowTeacherRequests] = useState(false);
  const [showScheduleHistory, setShowScheduleHistory] = useState(false);
  const [showTeacherRequestForm, setShowTeacherRequestForm] = useState(false);
  const [showEventsManagement, setShowEventsManagement] = useState(false);
  const [showNewsManagement, setShowNewsManagement] = useState(false);
  const [showUserMessages, setShowUserMessages] = useState(false);
  const [showCourseApplications, setShowCourseApplications] = useState(false);

  // Автозаполнение email в форме входа после подтверждения
  useEffect(() => {
    const confirmedEmail = localStorage.getItem('irfit_confirmed_email');
    if (confirmedEmail && !isRegistering) {
      setLoginData(prev => ({ ...prev, email: confirmedEmail }));
      // Очищаем сохраненный email
      localStorage.removeItem('irfit_confirmed_email');
    }
  }, [isRegistering]);


  const achievements = [
    { id: 1, title: 'Первый онлайн урок', description: 'Завершили первое занятие', icon: '🎯', unlocked: true },
    { id: 2, title: 'Неделя активности', description: 'Пройдено уроков 7 дней подряд', icon: '🔥', unlocked: true },
    { id: 3, title: 'Марафонец', description: '30 дней активности', icon: '🏃‍♂️', unlocked: false },
    { id: 4, title: 'Силач', description: 'Заработал 1000 FIT COIN', icon: '💪', unlocked: true },
    { id: 5, title: 'Кардио мастер', description: '100 уроков отсмотрено', icon: '❤️', unlocked: false },
    { id: 6, title: 'Йога гуру', description: '50 заданий выполнено', icon: '🧘‍♀️', unlocked: false },
  ];

  const stats = [
    { label: 'Уроков завершено', value: '24', icon: Target },
    { label: 'Дней активности', value: '18', icon: Calendar },
    { label: 'Место в лидерборде', value: '#15', icon: Trophy },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Отправляем вебхук на n8n
      const webhookData = {
        email: loginData.email,
        password: loginData.password,
        timestamp: new Date().toISOString(),
        action: 'login_attempt',
        source: 'irfit_app'
      };
      
      const webhookResponse = await fetch('https://n8n.bitcoinlimb.com/webhook/login-irfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
      
      if (webhookResponse.ok) {
        const responseData = await webhookResponse.json();
        console.log('Ответ от вебхука:', responseData);
        console.log('Тип ответа:', typeof responseData);
        console.log('Ключи ответа:', Object.keys(responseData));
        console.log('Содержимое responseData:', JSON.stringify(responseData, null, 2));
        console.log('responseData.success:', responseData.success);
        console.log('responseData.token:', responseData.token);
        
        // Проверяем успешность входа
        if (responseData.token) {
          // Декодируем JWT токен для получения данных пользователя
          const tokenData = decodeJWT(responseData.token);
          console.log('Декодированные данные токена:', tokenData);
          
          // Сохраняем JWT токен
          localStorage.setItem('irfit_token', responseData.token);
          localStorage.setItem('irfit_is_authenticated', 'true');
          
          const userDataToStore = {
            email: tokenData.email,
            isEditor: tokenData.isEditor,
            role: tokenData.role,
            userId: tokenData.userId
          };
          localStorage.setItem('irfit_user_data', JSON.stringify(userDataToStore));
          
          // Обновляем пользователя в контексте аутентификации
          updateUserFromToken(responseData.token);
          
          // Автоматически переключаемся на экран профиля
          localStorage.setItem('irfit_active_screen', 'profile');
          
          // Показываем сообщение об успехе
          alert('Вход выполнен успешно! Добро пожаловать в личный кабинет.');
        } else {
          // Ошибка входа
          console.log('Детали ошибки:', responseData);
          console.log('Проверка success:', responseData.success);
          console.log('Проверка token:', responseData.token);
          alert(responseData.message || 'Ошибка входа. Проверьте email и пароль.');
        }
      } else {
        console.warn('Ошибка отправки вебхука:', webhookResponse.status);
        alert('Ошибка соединения с сервером. Попробуйте еще раз.');
      }
    } catch (webhookError) {
      console.warn('Ошибка отправки вебхука:', webhookError);
      alert('Ошибка соединения. Проверьте интернет.');
    }
    
    setIsLoading(false);
  };

  // Функция для декодирования JWT токена
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      return decoded;
    } catch (error) {
      console.error('Ошибка декодирования JWT:', error);
      return {};
    }
  };

  // Функция для подтверждения кода
  const handleConfirmCode = async (code: string) => {
    if (!code.trim()) {
      alert('Введите код подтверждения');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://n8n.bitcoinlimb.com/webhook/confirm-irfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          code: code
        })
      });

      const responseData = await response.json();
      
      if (responseData.success) {
        alert('Email подтвержден! Теперь вы можете войти в систему.');
        setIsRegistering(false);
        setRegisterData({ email: '', password: '', name: '' });
        // Принудительно переходим к экрану входа с email для автозаполнения
        onForceGoToLogin(registerData.email);
      } else {
        alert(responseData.error || 'Ошибка подтверждения кода');
      }
    } catch (error) {
      console.error('Ошибка подтверждения:', error);
      alert('Ошибка подтверждения кода');
    }
    
    setIsLoading(false);
  };

  // Функция для повторной отправки кода
  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://n8n.bitcoinlimb.com/webhook/register-irfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registerData,
          resend: true,
          timestamp: new Date().toISOString(),
          action: 'resend_code',
          source: 'irfit_app'
        })
      });

      const responseData = await response.json();
      
      if (responseData.success) {
        alert('Новый код отправлен на email');
      } else {
        alert(responseData.message || 'Ошибка отправки кода');
      }
    } catch (error) {
      console.error('Ошибка отправки кода:', error);
      alert('Ошибка соединения. Попробуйте еще раз.');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Отправляем вебхук на n8n для регистрации
      const webhookData = {
        email: registerData.email,
        name: registerData.name,
        password: registerData.password,
        role: 'student', // Всегда регистрируем как ученика
        timestamp: new Date().toISOString(),
        action: 'register_attempt',
        source: 'irfit_app'
      };
      
      const webhookResponse = await fetch('https://n8n.bitcoinlimb.com/webhook/register-irfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
      
      if (webhookResponse.ok) {
        const responseData = await webhookResponse.json();
        console.log('Ответ от вебхука регистрации:', responseData);
        
        // Проверяем успешность регистрации
        if (responseData.success) {
          // Показываем экран подтверждения кода
          onShowEmailConfirmation({
            email: registerData.email,
            onConfirm: handleConfirmCode,
            onResend: handleResendCode,
            onBack: () => {
              // Возвращаемся к форме регистрации
              setIsRegistering(false);
            }
          });
        } else {
          alert(responseData.message || 'Ошибка регистрации. Попробуйте еще раз.');
        }
      } else {
        console.warn('Ошибка отправки вебхука регистрации:', webhookResponse.status);
        alert('Ошибка соединения с сервером. Попробуйте еще раз.');
      }
    } catch (webhookError) {
      console.warn('Ошибка отправки вебхука регистрации:', webhookError);
      alert('Ошибка соединения. Проверьте интернет.');
    }
    
    setIsLoading(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'student':
        return <User className="w-4 h-4 text-green-500" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'teacher':
        return 'Учитель';
      case 'student':
        return 'Ученик';
      default:
        return 'Ученик';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 md:max-w-lg transition-colors duration-300">
        <div className={`rounded-2xl p-6 shadow-lg transition-colors duration-300 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-[#94c356] to-[#7ba045] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Вход в личный кабинет</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Войдите, чтобы получить доступ к своему профилю</p>
          </div>

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#94c356] focus:border-transparent transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Введите ваш email"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Пароль
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-[#94c356] focus:border-transparent transition-all ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="Введите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#94c356] to-[#7ba045] text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 hover:from-[#7ba045] hover:to-[#94c356]"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Имя
                </label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#94c356] focus:border-transparent transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Введите ваше имя"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#94c356] focus:border-transparent transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Введите ваш email"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#94c356] focus:border-transparent transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Введите пароль"
                />
              </div>

              {/* Роль автоматически устанавливается как "student" */}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#94c356] to-[#7ba045] text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 hover:from-[#7ba045] hover:to-[#94c356]"
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}



          <div className="mt-6 text-center space-y-2">
            {!isRegistering ? (
              <>
                <button 
                  onClick={onGoToPasswordReset}
                  className="text-[#94c356] text-sm hover:underline"
                >
                  Забыли пароль?
                </button>
                <div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Нет аккаунта?{' '}
                  </span>
                  <button 
                    onClick={() => setIsRegistering(true)}
                    className="text-[#94c356] text-sm hover:underline"
                  >
                    Регистрация
                  </button>
                </div>
              </>
            ) : (
              <div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Уже есть аккаунт?{' '}
                </span>
                <button 
                  onClick={() => setIsRegistering(false)}
                  className="text-[#94c356] text-sm hover:underline"
                >
                  Войти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Если открыт экран заявки на роль учителя, показываем его
  if (showTeacherRequestForm) {
    return (
      <TeacherRequestForm
        onBack={() => setShowTeacherRequestForm(false)}
        isDark={isDark}
      />
    );
  }

  // Если открыт экран запросов учителей, показываем его
  if (showTeacherRequests) {
    return (
      <TeacherRequests
        onBack={() => setShowTeacherRequests(false)}
        isDark={isDark}
      />
    );
  }

  // Если открыт экран истории расписаний, показываем его
  if (showScheduleHistory) {
    return (
      <ScheduleHistory
        onBack={() => setShowScheduleHistory(false)}
        isDark={isDark}
      />
    );
  }

  // Если открыты настройки профиля, показываем их
  if (showProfileSettings) {
    return (
      <ProfileSettings
        user={user}
        onBack={() => setShowProfileSettings(false)}
      />
    );
  }

  // Если открыт экран управления событиями, показываем его
  if (showEventsManagement) {
    return (
      <EventsManagement
        onBack={() => setShowEventsManagement(false)}
        isDark={isDark}
      />
    );
  }

  // Если открыт экран управления новостями, показываем его
  if (showNewsManagement) {
    return (
      <NewsManagement
        onBack={() => setShowNewsManagement(false)}
        isDark={isDark}
      />
    );
  }

  // Если открыт экран управления сообщениями, показываем его
  if (showUserMessages) {
    return (
      <UserMessages
        onBack={() => setShowUserMessages(false)}
        isDark={isDark}
      />
    );
  }

  // Если открыт экран заявок на курс, показываем его
  if (showCourseApplications) {
    return (
      <CourseApplications
        onBack={() => setShowCourseApplications(false)}
        isDark={isDark}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 md:max-w-4xl md:px-8 transition-colors duration-300">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#94c356] to-[#7ba045] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <div className="flex items-center space-x-2">
                {getRoleIcon(user?.role || 'student')}
                <p className="text-white/90">{getRoleName(user?.role || 'student')}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Выйти"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* FIT COIN - только для учеников */}
        {user?.role === 'student' && (
          <div className="mt-6 flex items-center justify-between bg-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6 text-yellow-300" />
              <span className="font-semibold">FIT COIN</span>
            </div>
            <div className="text-2xl font-bold">1,250</div>
          </div>
        )}
      </div>

      {/* Stats - только для учеников */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`rounded-xl p-4 text-center shadow-sm transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <Icon className={`w-8 h-8 mx-auto mb-2 text-[#94c356]`} />
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stat.value}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Achievements - только для учеников */}
      {user?.role === 'student' && (
        <div className={`rounded-2xl p-6 transition-colors duration-300 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Достижения</h3>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-300 ${
                achievement.unlocked
                  ? isDark ? 'bg-[#94c356]/20 border border-[#94c356]/30' : 'bg-[#94c356]/10 border border-[#94c356]/30'
                  : isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {achievement.title}
                  </div>
                  <div className={`text-xs ${achievement.unlocked ? (isDark ? 'text-[#94c356]' : 'text-[#94c356]') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Запрос роли учителя - только для учеников */}
      {user?.role === 'student' && (
        <div className={`rounded-2xl p-6 transition-colors duration-300 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Развитие</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowTeacherRequestForm(true)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <GraduationCap className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Запросить роль учителя</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className={`rounded-2xl p-6 transition-colors duration-300 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Настройки</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setShowProfileSettings(true)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Settings className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Настройки профиля</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          
          <button className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}>
            <div className="flex items-center space-x-3">
              <Users className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Пригласить друзей</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
      </div>

      {/* Административные функции - только для администраторов */}
      {user?.role === 'admin' && (
        <div className={`rounded-2xl p-6 transition-colors duration-300 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Административные функции
          </h3>
          <div className="space-y-4">
            {/* Запросы на добавление в качестве Учителя */}
            <button
              onClick={() => setShowTeacherRequests(true)}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 hover:border-[#94c356] hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-[#94c356] hover:bg-gray-50'
              } group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <UserPlus className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Запросы на добавление в качестве Учителя
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Рассмотрение заявок от пользователей
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Последние изменения расписаний */}
            <button
              onClick={() => setShowScheduleHistory(true)}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 hover:border-[#94c356] hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-[#94c356] hover:bg-gray-50'
              } group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <History className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Последние изменения расписаний
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    История и фильтрация изменений
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <span className="text-xs font-bold text-white">∞</span>
                </div>
              </div>
            </button>

            {/* Управление событиями */}
            <button
              onClick={() => setShowEventsManagement(true)}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 hover:border-[#94c356] hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-[#94c356] hover:bg-gray-50'
              } group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Управление событиями
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Добавление и редактирование событий
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Публикация новостей */}
            <button
              onClick={() => setShowNewsManagement(true)}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 hover:border-[#94c356] hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-[#94c356] hover:bg-gray-50'
              } group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <span className="text-lg">🔔</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Публикация новостей
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Добавление, удаление и редактирование новостей
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Сообщения для пользователей */}
            <button
              onClick={() => setShowUserMessages(true)}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 hover:border-[#94c356] hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-[#94c356] hover:bg-gray-50'
              } group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <MessageSquare className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Сообщения для пользователей
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Отправка личных сообщений пользователям
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Заявки на курс */}
            <button
              onClick={() => setShowCourseApplications(true)}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 hover:border-[#94c356] hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-[#94c356] hover:bg-gray-50'
              } group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <Users className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Заявки на курс
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Подтверждение пользователей, назначение групп, отправка пушей
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center group-hover:bg-[#94c356] transition-colors`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile; 