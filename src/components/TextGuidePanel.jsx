import { motion } from 'framer-motion';
import BackgroundLayout from './BackgroundLayout';
import PageHeader from './PageHeader';

const GUIDE_SECTIONS = [
  {
    title: "Кесене туралы",
    text: "Қожа Ахмет Яссауи кесенесі — Қазақстандың Түркістан қаласында орналасқан орта ғасыр сәулетінің асыл туындысы. XIV ғасырдың соңында Темірдің бұйрығымен салынған. 2003 жылдан ЮНЕСКО-ның Дүниежүзілік мұрасы."
  },
  {
    title: "Бас күмбез",
    text: "Орталық Азиядағы ең ірі кірпіш күмбез. Диаметрі — шамамен 18 метр. Темір дәуірінің сәулетіне тән көгілдір глазурланған кірпішпен қапталған."
  },
  {
    title: "Қазандық — орталық зал",
    text: "Зал ортасында ритуалдық су үшін қола үлкен қазан тұр.Диаметрі 2 метрден асады, салмағы — 2 тонна. Араб жазулары мен өсімдік өрнектермен безендірілген."
  },
  {
    title: "Яссауи зираты",
    text: "Қабір тасы сұр-жасыл тастан жасалған және ою өрнектермен безендірілген. Қожа Ахмет Яссауи XII ғасырдың ұлы сопылық ақыны және ойшылы болған."
  },
  {
    title: "Ішкі безендіру",
    text: "Қабырғалар мозаика, тас ою-өрнектер мен каллиграфиялық жазулармен безендірілген. Геометриялық өрнектер алты жүз жылдан астам уақыт сақталған."
  },
  {
    title: "Кітапхана және мешіт",
    text: "Кесенеде кітапхана мен мешіт орналасқан — онда намаз оқылып, білім берілген. Бұл бөлмелер сол замандағы мәдениет пен ғылымның жоғары дәрежесін көрсетеді."
  },
];

export default function TextGuidePanel({ onBack }) {
  return (
    <BackgroundLayout overlayOpacity="bg-black/80">
      <PageHeader title="Мәтіндік гид" subtitle="Кесене туралы ақпарат" onBack={onBack} />

      <div className="flex-1 overflow-auto px-5 pb-5">
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          {GUIDE_SECTIONS.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm">
                  {idx + 1}
                </span>
                <h3 className="font-heading font-bold text-xl text-white">{section.title}</h3>
              </div>
              <p className="text-white/70 text-lg font-body leading-relaxed">
                {section.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </BackgroundLayout>
  );
}