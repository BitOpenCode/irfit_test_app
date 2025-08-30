import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, Search, MessageSquare, Send, User } from 'lucide-react';

interface UserMessagesProps {
  onBack: () => void;
  isDark: boolean;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const UserMessages: React.FC<UserMessagesProps> = ({ onBack, isDark }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Моковые данные для демонстрации
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 1,
        email: 'user1@example.com',
        name: 'Иван Петров',
        role: 'student',
        lastMessage: 'Спасибо за информацию о курсе!',
        lastMessageTime: '2 часа назад',
        unreadCount: 1
      },
      {
        id: 2,
        email: 'user2@example.com',
        name: 'Мария Сидорова',
        role: 'teacher',
        lastMessage: 'Когда будет следующее занятие?',
        lastMessageTime: '1 день назад',
        unreadCount: 0
      },
      {
        id: 3,
        email: 'user3@example.com',
        name: 'Алексей Козлов',
        role: 'student',
        lastMessage: 'Отличный курс!',
        lastMessageTime: '3 дня назад',
        unreadCount: 2
      }
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // Фильтрация пользователей по поисковому запросу
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleSendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    setIsLoading(true);
    
    try {
      // TODO: Здесь будет отправка сообщения через n8n workflow
      console.log('Отправка сообщения:', {
        userId: selectedUser.id,
        message: message.trim(),
        timestamp: new Date().toISOString()
      });

      // Очищаем поле сообщения
      setMessage('');
      
      // Показываем уведомление об успешной отправке
      alert('Сообщение отправлено!');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('Ошибка отправки сообщения. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-yellow-500';
      case 'teacher':
        return 'text-blue-500';
      case 'student':
        return 'text-green-500';
      default:
        return 'text-gray-500';
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
        return 'Пользователь';
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 md:max-w-4xl md:px-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Сообщения для пользователей
          </h1>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-6`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Поиск по email пользователя..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#94c356]' 
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-[#94c356]'
            } focus:outline-none focus:ring-2 focus:ring-[#94c356]/20`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className={`lg:col-span-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Пользователи ({filteredUsers.length})
            </h2>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  selectedUser?.id === user.id
                    ? isDark ? 'bg-[#94c356]/20' : 'bg-[#94c356]/10'
                    : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                      <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    {user.unreadCount && user.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{user.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {user.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)} bg-opacity-10`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.email}
                    </p>
                    {user.lastMessage && (
                      <div className="mt-1">
                        <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {user.lastMessage}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                          {user.lastMessageTime}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-2 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          {selectedUser ? (
            <div className="h-96 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                    <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {selectedUser.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Начните диалог с пользователем
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Введите сообщение..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#94c356]' 
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-[#94c356]'
                    } focus:outline-none focus:ring-2 focus:ring-[#94c356]/20`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      message.trim() && !isLoading
                        ? 'bg-[#94c356] hover:bg-[#7ba045] text-white'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Выберите пользователя для начала диалога</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMessages;
