import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Award, Users, Play, BookOpen } from 'lucide-react';
import EventsList from '../EventsList';
import CourseDetails from './CourseDetails';

interface CoursesProps {
  onNavigateToFFT?: () => void;
  onNavigateToODA?: () => void;
  onNavigateToAnatomy?: () => void;
}

const Courses: React.FC<CoursesProps> = ({ onNavigateToFFT, onNavigateToODA, onNavigateToAnatomy }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  
  const isAdmin = user?.role === 'admin';

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourse(courseId);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const handleFFTCourseClick = () => {
    if (onNavigateToFFT) {
      onNavigateToFFT();
    }
  };

  const handleODACourseClick = () => {
    if (onNavigateToODA) {
      onNavigateToODA();
    }
  };

  const handleAnatomyCourseClick = () => {
    if (onNavigateToAnatomy) {
      onNavigateToAnatomy();
    }
  };

  const courses = [
    {
      id: 1,
      title: 'Эксперт восстановительного фитнеса',
      duration: '9 месяцев',
      type: 'Основной курс',
      price: 'Диплом',
      startDate: 'Сентябрь 2024',
      description: 'Комплексная подготовка специалистов в области восстановительного фитнеса с получением диплома государственного образца.',
      features: [
        'Физическая реабилитация',
        'Двигательная терапия',
        'Современный фитнес',
        'Медицинские случаи',
        'Практические навыки'
      ],
      icon: Award
    },
    {
      id: 2,
      title: 'FFT Functional Future Training',
      duration: '24 часа',
      type: 'Интенсив',
      price: 'Сертификат',
      startDate: '15 октября 2024',
      description: 'Интенсивный курс по функциональному тренингу будущего для повышения квалификации.',
      features: [
        'Функциональные движения',
        'Современные методики',
        'Практические занятия',
        'Сертификация'
      ],
      icon: Play
    },
    {
      id: 3,
      title: 'Функциональная диагностика ОДА',
      duration: '24 часа',
      type: 'Интенсив',
      price: 'Сертификат',
      startDate: '15 октября 2025',
      description: 'Специализированный курс по диагностике опорно-двигательного аппарата.',
      features: [
        'Диагностические методы',
        'Оценка состояния ОДА',
        'Практические навыки',
        'Работа с клиентами'
      ],
      icon: BookOpen
    },
    {
      id: 4,
      title: 'Анатомия для тренера',
      duration: '35 часов',
      type: 'Интенсив',
      price: 'Сертификат',
      startDate: '15 октября 2024',
      description: 'Углубленное изучение анатомии для профессиональных тренеров.',
      features: [
        'Детальная анатомия',
        'Функциональные связи',
        'Практическое применение',
        'Клинические случаи'
      ],
      icon: Users
    }
  ];





  // Если выбран курс, показываем детальный экран
  if (selectedCourse) {
    return (
      <CourseDetails 
        courseId={selectedCourse}
        onBack={handleBackToCourses}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 md:max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#94c356] to-[#7ba045] bg-clip-text text-transparent">
          Образовательные программы
        </h1>
        <p className={`text-lg ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Профессиональное обучение в области восстановительного фитнеса
        </p>
      </div>

      {/* Courses Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#94c356] to-[#7ba045] bg-clip-text text-transparent">
          Наши курсы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div key={course.id} className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gray-800 border border-gray-700 hover:border-[#94c356]' 
                  : 'bg-white border border-gray-200 hover:border-[#94c356] shadow-xl'
              }`}>
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-[#94c356]/10 dark:bg-[#94c356]/20 mr-4">
                    <Icon className="w-6 h-6 text-[#94c356]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {course.title}
                    </h3>
                    <span className="text-sm text-[#94c356] font-medium">
                      {course.type}
                    </span>
                  </div>
                </div>
                
                <p className={`text-sm mb-4 leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {course.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {course.startDate}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium rounded-full">
                    {course.price}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {course.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#94c356] rounded-full"></div>
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    if (course.id === 2) return handleFFTCourseClick();
                    if (course.id === 3) return handleODACourseClick();
                    if (course.id === 4) return handleAnatomyCourseClick();
                    return handleCourseSelect(course.id);
                  }}
                  className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-[#94c356] hover:bg-[#7ba045] text-white'
                      : 'bg-[#94c356] hover:bg-[#7ba045] text-white'
                  }`}>
                  Подробнее
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className={`p-6 rounded-2xl ${
        isDark 
          ? 'bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-700' 
          : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'
      }`}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-orange-600">
            Ближайшие события
          </h2>
        </div>
        
        <EventsList 
          onEditEvent={undefined}
          onDeleteEvent={undefined}
        />
      </div>
    </div>
  );
};

export default Courses;