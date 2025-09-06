import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { LOGO_PATH } from '../../utils/paths';

const Home: React.FC = () => {
  const { isDark } = useTheme();

  const irfitCards = [
    {
      title: "Что?",
      icon: "🎯",
      content: "Институт восстановительного фитнеса IRFit — это первый в России институт, объединяющий физическую реабилитацию, двигательную терапию и современный фитнес в единую систему обучения. Мы готовим специалистов, способных не просто тренировать, но и восстанавливать клиентов, работая с любыми запросами и ограничениями по здоровью."
    },
    {
      title: "Для кого?",
      icon: "👥",
      content: "– Для новичков в тренинге — тех, кто хочет войти в востребованную нишу и построить карьеру в фитнесе, став универсальным экспертом с освоением всех направлений: групповых программ, тренажёрного зала и восстановительного фитнеса.\n\n– Для практикующих специалистов (фитнес-тренеров, реабилитологов, массажистов), готовых перейти на экспертный уровень в восстановительном фитнесе и увеличить доход."
    },
    {
      title: "Зачем?",
      icon: "💎",
      content: "– Превратите свои навыки в эксклюзивную экспертизу и увеличьте средний чек в 2–3 раза.\n\n– Работайте с клиентами, которые ценят результат и готовы платить.\n\n– Освойте сложные медицинские случаи, недоступные 95% коллег.\n\n– Выходите на премиальный сегмент клиентов.\n\n– Диверсифицируйте источники дохода."
    },
    {
      title: "Как?",
      icon: "🚀",
      content: "Наш основной курс — «Эксперт восстановительного фитнеса». За 9 месяцев дистанционного обучения с использованием современных образовательных технологий вы получите комплексную подготовку под руководством ведущих экспертов и диплом."
    }
  ];

  const irfitInfo = {
    title: "Информация об IRFIT",
    subtitle: "Что такое IRFit",
    description: "С 2010 года наша команда формирует профессиональное фитнес-сообщество, объединяя знания, опыт и инновации. Начав с офлайн-обучения, мы подготовили более 2000 фитнес-тренеров, а 40 фитнес-клубов сотрудничают с нами и благодарны нам за квалифицированных специалистов.",
    achievements: [
      "14+ лет в фитнес-индустрии",
      "2000+ выпускников, подтвердивших наш уровень",
      "Федеральный опыт через масштабные конвенции",
      "Фокус на восстановительный фитнес — тренд будущего",
      "Практико-ориентированное обучение с топ-экспертами",
      "Официальная лицензия на образовательную деятельность",
      "Диплом государственного образца, приравненный к диплому ВУЗа"
    ]
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 md:max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#94c356] shadow-2xl bg-white p-1">
            <img 
              src={LOGO_PATH} 
              alt="IRFit Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#94c356] to-[#7ba045] bg-clip-text text-transparent">
          Институт Восстановительного Фитнеса
        </h1>
        <p className={`text-lg md:text-xl ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Готовим специалистов нового поколения в восстановительном фитнесе
        </p>
      </div>

      {/* 4 Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {irfitCards.map((card, index) => (
          <div key={index} className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-gray-800 border border-gray-700 hover:border-[#94c356]' 
              : 'bg-white border border-gray-200 hover:border-[#94c356] shadow-xl'
          }`}>
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{card.icon}</span>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#94c356] to-[#7ba045] bg-clip-text text-transparent">
                {card.title}
              </h3>
            </div>
            <p className={`leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {card.content}
            </p>
          </div>
        ))}
      </div>

      {/* IRFit Information */}
      <div className={`p-8 rounded-2xl mb-8 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700' 
          : 'bg-gradient-to-r from-gray-50 to-white border border-gray-200'
      }`}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-[#94c356] to-[#7ba045] bg-clip-text text-transparent">
          {irfitInfo.title}
        </h2>
        <h3 className="text-xl font-semibold mb-4 text-center text-orange-600">
          {irfitInfo.subtitle}
        </h3>
        <p className={`text-lg leading-relaxed mb-6 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {irfitInfo.description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {irfitInfo.achievements.map((achievement, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#94c356] rounded-full"></div>
              <span className={`${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {achievement}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className={`text-center p-8 rounded-2xl ${
        isDark 
          ? 'bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-700' 
          : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'
      }`}>
        <h3 className="text-2xl font-bold mb-4 text-orange-600">
          Готовы стать экспертом?
        </h3>
        <p className={`text-lg mb-6 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Присоединяйтесь к сообществу профессионалов восстановительного фитнеса
        </p>
        <a 
          href="https://irfit.ru/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`inline-block px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-[#94c356] to-[#7ba045] hover:from-[#7ba045] hover:to-[#94c356] transition-all duration-300 transform hover:scale-105 shadow-lg`}
        >
          Начать обучение
        </a>
      </div>
    </div>
  );
};

export default Home;