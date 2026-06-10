import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

export function TipsSection() {
  const tips = [
    {
      category: '프로젝트 작성 팁',
      icon: Lightbulb,
      items: [
        '프로젝트 설명은 구체적인 수치와 함께 작성하세요 (예: 성능 30% 개선)',
        '본인이 담당한 파트를 명확히 구분하여 작성하세요',
        '기술 선택의 이유와 문제 해결 과정을 포함하세요',
      ]
    },
    {
      category: '기술 스택 작성법',
      icon: CheckCircle,
      items: [
        '단순 사용 경험이 아닌 실제 프로젝트 적용 경험을 기재하세요',
        '숙련도는 정직하게 평가하고, 가능한 작업을 구체적으로 나열하세요',
        '최신 트렌드를 반영하되, 실제 사용 가능한 기술만 포함하세요',
      ]
    },
    {
      category: '주의해야 할 점',
      icon: AlertCircle,
      items: [
        '과장된 표현보다는 사실에 기반한 내용을 작성하세요',
        '링크(GitHub, 데모)는 반드시 작동하는지 확인하세요',
        '오타와 문법 오류를 꼼꼼히 확인하세요',
      ]
    },
  ];

  return (
    <section className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          포트폴리오 작성 가이드
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-12">
          합격자들의 포트폴리오에서 발견한 노하우
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  index === 1 ? 'bg-green-100 dark:bg-green-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <tip.icon className={`w-6 h-6 ${
                    index === 0 ? 'text-yellow-600 dark:text-yellow-400' :
                    index === 1 ? 'text-green-600 dark:text-green-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{tip.category}</h3>
              </div>
              
              <ul className="space-y-3">
                {tip.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
