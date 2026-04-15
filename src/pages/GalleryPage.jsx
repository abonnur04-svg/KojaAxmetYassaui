import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackgroundLayout from '../components/BackgroundLayout';
import PageHeader from '../components/PageHeader';

export const GALLERY_ITEMS = [
  // ── Сыртқы көрініс ───────────────────────────────────────────────────────
  {
    id: 1,
    title: "Кесене — жалпы көрінісі",
    subtitle: "XIV ғасыр, Әмір Темір дәуірі",
    description: "Қожа Ахмет Яссауи кесенесінің толық сыртқы көрінісі. Ғимарат 1389–1405 жылдары Әмір Темірдің бұйрығымен салынған. Биіктігі 44 метр, ені 65 метр. Орталық Азиядағы ең ірі Темір дәуіріне жататын сәулет ескерткіші және ЮНЕСКО Дүниежүзілік мұрасы.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Mausoleum_of_Khoja_Ahmed_Yasawi.jpg/500px-Mausoleum_of_Khoja_Ahmed_Yasawi.jpg",
    category: "Сыртқы көрініс",
  },
  {
    id: 2,
    title: "Бас күмбез",
    subtitle: "Орталық Азиядағы ең ірі күмбез",
    description: "Кесененің бас күмбезі — Орталық Азиядағы ең ірі ортағасырлық күмбездердің бірі. Оның сыртқы диаметрі 18,2 метр, биіктігі 28 метрге жетеді. Күмбез қос қабатты кірпіш құрылыммен тұрғызылған, беті көгілдір глазурланған плиткамен қапталған.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Dome_%285607243550%29.jpg/500px-Dome_%285607243550%29.jpg",
    category: "Сыртқы көрініс",
  },
  {
    id: 3,
    title: "Пештак — бас кіреберіс",
    subtitle: "Монументалды кіреберіс аркасы",
    description: "Кесененің бас кіреберісі — пештак — биіктігі 37,85 метрге жетеді. Беті майолика плиткаларымен, геометриялық өрнектермен және куфи каллиграфиясымен безендірілген. Бұл Темір дәуірі сәулетінің ең тамаша элементтерінің бірі.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mausoleum_of_Khoja_Ahmed_Yasawi_02.jpg/500px-Mausoleum_of_Khoja_Ahmed_Yasawi_02.jpg",
    category: "Сыртқы көрініс",
  },
  {
    id: 4,
    title: "Артқы көрініс — банна'и",
    subtitle: "Глазурланған кірпіш техникасы",
    description: "Кесененің артқы фасады banna'i техникасымен безендірілген — глазурланған және күйдірілген кірпіштердің кезектесуінен жасалған геометриялық өрнектер. Бұл Темір дәуірі сәулетінің ерекше белгісі, Самарқанд пен Бұхара ғимараттарымен ұқсас стиль.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan%2C_Kazakhstan.jpg/500px-Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan%2C_Kazakhstan.jpg",
    category: "Сыртқы көрініс",
  },
  {
    id: 5,
    title: "Бүйір көрінісі",
    subtitle: "Кесене қабырғалары мен бұрыштары",
    description: "Кесененің бүйір көрінісінен ғимараттың масштабы мен пропорциясы айқын байқалады. Қабырғалар биіктігі 12 метрге жетеді, ал бұрыштарда бұрыштық мұнаралар орналасқан. Сыртқы қабырғалар күйдірілген кірпіштен тұрғызылған.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mausoleum_Side_%285607248398%29.jpg/500px-Mausoleum_Side_%285607248398%29.jpg",
    category: "Сыртқы көрініс",
  },
  {
    id: 6,
    title: "Қабырғадан көрініс",
    subtitle: "Ежелгі қорған қабырғаларынан",
    description: "Кесенені Әзірет Сұлтан қорғанының ежелгі қабырғаларынан көруге болады. Бұл ракурстан ғимараттың аумағы мен оның Түркістан қаласының тарихи ландшафтындағы орны айқын бейнеленеді.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Mausoleum_from_the_Walls_%285607253618%29.jpg/500px-Mausoleum_from_the_Walls_%285607253618%29.jpg",
    category: "Сыртқы көрініс",
  },
  {
    id: 7,
    title: "Екі кесене",
    subtitle: "Яссауи және Рабиға Сұлтан Бегім",
    description: "Қожа Ахмет Яссауи кесенесінің жанында Рабиға Сұлтан Бегімнің кесенесі орналасқан. Рабиға Сұлтан Бегім — Әбілхайыр ханның жұбайы, XV ғасырда өмір сүрген. Екі ғимарат бірге Әзірет Сұлтан кешенін құрайды.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Two_Mausolea_%285607266720%29.jpg/500px-Two_Mausolea_%285607266720%29.jpg",
    category: "Сыртқы көрініс",
  },
  // ── Интерьер ──────────────────────────────────────────────────────────────
  {
    id: 8,
    title: "Тайқазан",
    subtitle: "Алып қола ритуалдық қазан, 1399 ж.",
    description: "Тайқазан — кесене ішіндегі ең атақты артефакт. Диаметрі 2,2 метр, салмағы шамамен 2 тонна болатын бұл алып қола қазан 1399 жылы жасалған. Беті арабша жазулар мен өсімдік өрнектерімен безендірілген. Ритуалдық ас берулер кезінде қолданылған.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Taykazan_copy_%282024-04-02%29_01.jpg/500px-Taykazan_copy_%282024-04-02%29_01.jpg",
    category: "Артефактілер",
  },
  {
    id: 9,
    title: "Яссауи зираты",
    subtitle: "Қасиетті қажылық орны",
    description: "Қожа Ахмет Яссауидің зираты — кесене ішіндегі ең қасиетті орын. Қабір тасы сұр-жасыл яшмадан жасалған және ою-өрнектермен безендірілген. XII ғасырда өмір сүрген Яссауи — түркі дүниесіндегі сопылық поэзиясының негізін қалаушы.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Tomb_of_Khoja_Ahmed_Yasawi.jpg/500px-Tomb_of_Khoja_Ahmed_Yasawi.jpg",
    category: "Тарихи орын",
  },
  {
    id: 10,
    title: "Қазандық залы",
    subtitle: "Орталық зал — кесененің жүрегі",
    description: "Қазандық залы — кесененің ең ірі және орталық залы. Зал төбесін Орталық Азиядағы ең үлкен күмбез жабады. Осы залда Тайқазан орналасқан, ал қабырғалары мозаика мен каллиграфиялық жазулармен безендірілген.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_01.jpg/500px-Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_01.jpg",
    category: "Интерьер",
  },
  {
    id: 11,
    title: "Ішкі аркалар",
    subtitle: "Стрельчатты арка жүйесі",
    description: "Кесене ішіндегі стрельчатты (сүйір) аркалар Темір дәуірі сәулетінің классикалық элементі. Олар залдарды бір-бірімен байланыстырады және ғимараттың ішкі кеңістігін көрнекі бөліктерге бөледі. Арка беттері ою-өрнектермен безендірілген.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_05.jpg/500px-Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_05.jpg",
    category: "Интерьер",
  },
  {
    id: 12,
    title: "Ішкі зал безендіруі",
    subtitle: "Қабырға мозаикасы мен ою-өрнектер",
    description: "Кесенеде 35-тен астам зал бар. Залдар қабырғалары мен төбелері мозаика плиткалары, тас ою-өрнектер және каллиграфиялық жазулармен безендірілген. Геометриялық өрнектер мен гүлдік мотивтер 600 жылдан астам уақыт бойы сақталған.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_10.jpg/500px-Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_10.jpg",
    category: "Интерьер",
  },
  // ── Сәулет бөлшектері ─────────────────────────────────────────────────────
  {
    id: 13,
    title: "Банна'и техникасы",
    subtitle: "Глазурланған кірпіш өрнектері",
    description: "Банна'и — глазурланған және күйдірілмеген кірпіштерді кезектестіре қалау техникасы. Нәтижесінде геометриялық өрнектер пайда болады: жұлдыздар, ромбтар, кресттер. Темір дәуірі Самарқанд мектебінің ерекше стилі. Бұл техника Орталық Азия сәулетінде кеңінен тараған.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Banna%27i_tiling_technique.jpg/500px-Banna%27i_tiling_technique.jpg",
    category: "Безендіру",
  },
  {
    id: 14,
    title: "Плитка өрнектері",
    subtitle: "Геометриялық майолика композициясы",
    description: "Кесене қабырғаларындағы майолика плиткалары — түрлі-түсті глазурланған керамикадан жасалған. Өрнектер математикалық дәлдікпен жасалған: алтыбұрыштар, жұлдыздар және тармақталған сызықтар. Әрбір элемент символикалық мағынаға ие — шексіздік пен жаратушының бірлігі.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Tile_Pattern_%285606658191%29.jpg/500px-Tile_Pattern_%285606658191%29.jpg",
    category: "Безендіру",
  },
  {
    id: 15,
    title: "Терезе безендіруі",
    subtitle: "Тас ою-өрнек және тор",
    description: "Кесене терезелері тас ою-өрнекті панжаралармен (торлармен) безендірілген. Олар табиғи жарықты сүзіп, ішкі кеңістікке жұмсақ сәуле түсіреді. Әрбір терезе өзіндік геометриялық өрнегімен ерекшеленеді. Ою-өрнек техникасы Темір заманы тас кесу шеберлігін көрсетеді.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Window_detail%21_%285607240232%29.jpg/500px-Window_detail%21_%285607240232%29.jpg",
    category: "Безендіру",
  },
  {
    id: 16,
    title: "Ежелгі есік",
    subtitle: "Ағаш ою-өрнек өнері",
    description: "Кесененің ішкі есіктері ағаш ою-өрнекпен безендірілген. Олар XIV–XV ғасырлардың шебер ағаш ұсталарының қолымен жасалған. Есік беттеріндегі геометриялық өрнектер мен каллиграфиялық жазулар ислам сәулет өнерінің дәстүрін жалғастырады.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Door_%285607236146%29.jpg/500px-Door_%285607236146%29.jpg",
    category: "Безендіру",
  },
  // ── Қосымша ───────────────────────────────────────────────────────────────
  {
    id: 17,
    title: "Кесене алаңы",
    subtitle: "Кесенеге апаратын жол",
    description: "Кесененің алдындағы кең алаң мен жаяу жүргіншілер жолы. Алаң ежелгі Әзірет Сұлтан қорған аумағында орналасқан. Мұнда қажылар мен туристер жиналады. 2003 жылы ЮНЕСКО Дүниежүзілік мұра тізіміне енгізілгеннен кейін кешеннің инфрақұрылымы жаңартылды.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Mausoleum_of_Khoja_Ahmed_Yasawi_01.jpg/500px-Mausoleum_of_Khoja_Ahmed_Yasawi_01.jpg",
    category: "Сыртқы көрініс",
  },
  {
    id: 18,
    title: "Кесененің панорамалық көрінісі",
    subtitle: "Толық сәулеттік композиция",
    description: "Кесененің панорамалық көрінісінде ғимараттың толық сәулеттік композициясы көрсетілген: бас пештак, бүйір қабырғалар, бұрыштық мұнаралар және бас күмбез. Ғимарат аяқталмаған — Темірдің 1405 жылғы қайтыс болуымен құрылыс тоқтатылды. Осыған қарамастан, ол Темір дәуірі сәулетінің шедевр туындысы.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Mausoleum_of_Khoja_Ahmed_Yasawi_%287519825502%29.jpg/500px-Mausoleum_of_Khoja_Ahmed_Yasawi_%287519825502%29.jpg",
    category: "Сыртқы көрініс",
  },
  {
    id: 19,
    title: "Ішкі күмбез құрылымы",
    subtitle: "Күмбез астындағы кірпіш өрнектер",
    description: "Кесене ішіндегі күмбез астынан қарағандағы көрініс. Кірпіш қалау техникасымен жасалған күмбездің ішкі беті — мукарнас (ұялы безендіру) элементтерімен әшекейленген. Бұл техника жарықтың рефракциясын жасап, залға ерекше атмосфера береді. Күмбездің конструктивтік шешімі XIV ғасыр инженерлік шеберлігін көрсетеді.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_03.jpg/500px-Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_03.jpg",
    category: "Интерьер",
  },
  {
    id: 20,
    title: "Ішкі дәліз және ою-өрнек",
    subtitle: "Залдар арасындағы өткел",
    description: "Кесененің ішкі дәліздері 35-тен астам залды бір-бірімен байланыстырады. Дәліз қабырғаласы кірпіш арка конструкциясымен тұрғызылып, геометриялық ою-өрнектермен безендірілген. Әрбір дәліздің жоғары бөлігінде стрельчатты (сүйір) арка формасы бар — бұл Темір дәуірі сәулетінің классикалық белгісі.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_07.jpg/500px-Interior_of_Mausoleum_of_Khoja_Ahmed_Yasawi_07.jpg",
    category: "Интерьер",
  },
];

export default function GalleryPage() {
  const navigate = useNavigate();

  return (
    <BackgroundLayout overlayOpacity="bg-black/75">
      <PageHeader title="Галерея" subtitle="Кесенеге байланысты фотосуреттер" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-auto px-4 py-4"
      >
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {GALLERY_ITEMS.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.07 }}
              onClick={() => navigate(`/gallery/${item.id}`)}
              className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square active:scale-95 transition-transform"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <p className="text-white font-heading font-bold text-sm leading-tight">{item.title}</p>
                <p className="text-white/60 text-xs mt-0.5">{item.category}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </BackgroundLayout>
  );
}
