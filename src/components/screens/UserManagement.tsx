import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Users, Mail, Calendar, Crown, GraduationCap, User, MoreVertical, Edit, Trash2, Eye, Send, XCircle } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
  last_login?: string;
  is_active: boolean;
  tgid?: number;
}

interface UserManagementProps {
  onBack: () => void;
  isDark: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack, isDark }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Загружаем пользователей при открытии экрана
  useEffect(() => {
    fetchUsers();
  }, []);

  // Фильтрация пользователей
  useEffect(() => {
    let filtered = users;

    // Поиск по email
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по роли
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('irfit_token');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch('https://n8n.bitcoinlimb.com/webhook/users-take', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setError('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указана';
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'student':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSendMessage = (user: User) => {
    if (!user.tgid) {
      alert('У пользователя нет Telegram ID для отправки сообщения');
      return;
    }
    
    setSelectedUser(user);
    setMessageText('');
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!selectedUser || !messageText.trim()) {
      alert('Введите сообщение для отправки');
      return;
    }

    setIsSendingMessage(true);
    
    try {
      const token = localStorage.getItem('irfit_token');
      if (!token) {
        throw new Error('Токен не найден');
      }

      // Используем GET метод с query параметрами для обхода CORS
      const params = new URLSearchParams({
        tgid: selectedUser.tgid.toString(),
        message_text: messageText.trim(),
        user_email: selectedUser.email
      });

      const response = await fetch(`https://n8n.bitcoinlimb.com/webhook/user-message-send?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Результат отправки сообщения:', result);
      
      alert(`Сообщение успешно отправлено пользователю ${selectedUser.email}!`);
      setShowMessageModal(false);
      setMessageText('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('Ошибка отправки сообщения. Попробуйте еще раз.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userEmail}? Это действие нельзя отменить.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('irfit_token');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch('https://n8n.bitcoinlimb.com/webhook/delete-user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        // Удаляем пользователя из локального состояния
        setUsers(prev => prev.filter(user => user.id !== userId));
        setFilteredUsers(prev => prev.filter(user => user.id !== userId));
        alert('Пользователь успешно удален!');
      } else {
        setError(data.error || 'Ошибка удаления пользователя');
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      setError('Ошибка удаления пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#94c356] mb-4"></div>
            <p>Загрузка пользователей...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">
            Управление пользователями
          </h1>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors disabled:opacity-50`}
            title="Обновить данные"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-xl font-bold mb-2">Управление пользователями</h2>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Просмотр, поиск и управление всеми пользователями системы
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`rounded-xl p-4 ${isDark ? 'bg-red-900/20 border border-red-600/30' : 'bg-red-50 border border-red-200'} shadow-sm`}>
            <div className="flex items-start space-x-3">
              <div className="text-red-600 text-lg">❌</div>
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Ошибка</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Фильтры и поиск */}
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-4">
            {/* Поиск */}
                          <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск по email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#94c356] focus:border-transparent transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>

            {/* Фильтры */}
            <div className="grid grid-cols-2 gap-4">
              {/* Фильтр по роли */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Роль
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#94c356] focus:border-transparent transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="all">Все роли</option>
                  <option value="admin">Администраторы</option>
                  <option value="teacher">Учителя</option>
                  <option value="student">Ученики</option>
                </select>
              </div>

              {/* Фильтр по статусу */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Статус
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#94c356] focus:border-transparent transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="all">Все статусы</option>
                  <option value="active">Активные</option>
                  <option value="inactive">Неактивные</option>
                </select>
              </div>
            </div>

            {/* Статистика */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Найдено: {filteredUsers.length} из {users.length}</span>
              <div className="flex space-x-4">
                <span>Админов: {users.filter(u => u.role === 'admin').length}</span>
                <span>Учителей: {users.filter(u => u.role === 'teacher').length}</span>
                <span>Учеников: {users.filter(u => u.role === 'student').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Список пользователей */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.email}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span>ID: {user.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                    {getRoleName(user.role)}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Активен' : 'Неактивен'}
                  </div>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Регистрация: {formatDate(user.created_at)}</span>
                </div>
                {user.last_login && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Последний вход: {formatDate(user.last_login)}</span>
                  </div>
                )}
              </div>

              {/* Telegram ID */}
              {user.tgid && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Telegram ID:</div>
                  <div className="text-sm text-blue-800 font-mono">{user.tgid}</div>
                </div>
              )}

              {/* Действия */}
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-1 text-sm"
                  title="Просмотр профиля"
                >
                  <Eye className="w-4 h-4" />
                  <span>Просмотр</span>
                </button>
                <button
                  onClick={() => handleSendMessage(user)}
                  disabled={!user.tgid}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 text-sm ${
                    user.tgid
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  title={user.tgid ? 'Отправить сообщение' : 'Нет Telegram ID'}
                >
                  <Send className="w-4 h-4" />
                  <span>Сообщение</span>
                </button>
                <button
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-1 text-sm"
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-1 text-sm disabled:opacity-50"
                  title="Удалить пользователя"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-6xl mb-4">👥</div>
              <p className="text-lg">Пользователи не найдены</p>
              <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос</p>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для отправки сообщения */}
      {showMessageModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Отправить сообщение пользователю
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <XCircle className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            
            <div className="mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mb-3`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Пользователь:</strong> {selectedUser.email}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Telegram ID:</strong> {selectedUser.tgid}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Роль:</strong> {getRoleName(selectedUser.role)}
                </p>
              </div>
              
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Сообщение:
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Введите сообщение для отправки..."
                rows={4}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#94c356]' 
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-[#94c356]'
                } focus:outline-none focus:ring-2 focus:ring-[#94c356]/20`}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Отмена
              </button>
              <button
                onClick={sendMessage}
                disabled={isSendingMessage || !messageText.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSendingMessage || !messageText.trim()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-[#94c356] hover:bg-[#7ba045] text-white'
                }`}
              >
                {isSendingMessage ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
