import type { Product, Recipe } from "./model";

// Values are per 100 g of the edible product in the stated measurement state.
// These are local records: the app does not fetch nutrition data at runtime.
export const products: readonly Product[] = [
  {
    id: "rolled-oats",
    name: "Овсяные хлопья",
    nutrition: [{
      state: "dry",
      per100g: { calories: 369, protein: 14.1, fat: 6.7, carbohydrates: 57.2 },
      source: {
        title: "Matvaretabellen · Rolled oats",
        url: "https://www.matvaretabellen.no/en/rolled-oats/",
        recordId: "05.003",
        checkedAt: "2026-11-17",
      },
    }],
  },
  {
    id: "milk",
    name: "Молоко 1,2%",
    allergens: ["milk"],
    gramsPerUnit: [{
      state: "ready", unit: "ml", grams: 1.03,
      source: {
        title: "FAO/INFOODS Density Database 2.0 · Milk, liquid (whole, semi-skimmed, skimmed)",
        url: "https://www.fao.org/fileadmin/templates/food_composition/documents/density_DB_v2_0_01.pdf#page=13",
        checkedAt: "2026-11-18",
        note: "Бытовая оценка: 1 мл жидкого молока ≈ 1,03 г. Применяется к полуобезжиренному коровьему молоку, не к любому напитку.",
      },
    }],
    nutrition: [{
      state: "ready",
      per100g: { calories: 45, protein: 4, fat: 1.2, carbohydrates: 4.5 },
      source: {
        title: "Matvaretabellen · Milk, semi-skimmed, 1.2% fat, UHT-treated",
        url: "https://www.matvaretabellen.no/en/milk-semi-skimmed-1-2-fat-uht-treated/",
        recordId: "01.119",
        checkedAt: "2026-11-17",
      },
    }],
  },
  {
    id: "banana",
    name: "Банан",
    gramsPerUnit: [{
      state: "raw", unit: "piece", grams: 118,
      pieceLabels: ["средний банан", "средних банана", "средних бананов"],
      source: {
        title: "USDA · Nutritive Value of Foods · Table 9, Bananas, raw, medium",
        url: "https://www.ars.usda.gov/ARSUserFiles/oc/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf#page=36",
        checkedAt: "2026-11-18",
        note: "1 средний банан — в среднем 118 г съедобной части без кожуры. Это оценка, а не результат взвешивания конкретного плода.",
      },
    }],
    nutrition: [{
      state: "raw",
      per100g: { calories: 88, protein: 1.1, fat: 0.2, carbohydrates: 19.7 },
      source: {
        title: "Matvaretabellen · Banana, raw",
        url: "https://www.matvaretabellen.no/en/banana-raw/",
        recordId: "06.525",
        checkedAt: "2026-11-17",
      },
    }],
  },
  {
    id: "yoghurt",
    name: "Натуральный йогурт 3,4%",
    allergens: ["milk"],
    nutrition: [{
      state: "ready",
      per100g: { calories: 69, protein: 4, fat: 3.4, carbohydrates: 5.6 },
      source: {
        title: "Matvaretabellen · Yoghurt, whole milk, plain",
        url: "https://www.matvaretabellen.no/en/yoghurt-whole-milk-plain/",
        recordId: "01.011",
        checkedAt: "2026-11-17",
      },
    }],
  },
  {
    id: "chicken-breast",
    name: "Куриная грудка без кожи и костей",
    nutrition: [{
      state: "raw",
      per100g: { calories: 111, protein: 23, fat: 2.1, carbohydrates: 0 },
      source: {
        title: "Matvaretabellen · Chicken, fillet, without skin, raw",
        url: "https://www.matvaretabellen.no/en/chicken-fillet-without-skin-raw/",
        recordId: "03.205",
        checkedAt: "2026-11-19",
      },
    }],
  },
  {
    id: "white-rice",
    name: "Рис белый длиннозёрный",
    nutrition: [{
      state: "dry",
      per100g: { calories: 343, protein: 7.8, fat: 0.7, carbohydrates: 75.9 },
      source: {
        title: "Matvaretabellen · Rice, white, long-grain, uncooked",
        url: "https://www.matvaretabellen.no/en/rice-white-long-grain-uncooked/",
        recordId: "05.212",
        checkedAt: "2026-11-19",
      },
    }],
  },
  {
    id: "broccoli",
    name: "Брокколи, съедобная часть",
    nutrition: [{
      state: "raw",
      per100g: { calories: 24, protein: 2.9, fat: 0, carbohydrates: 2 },
      source: {
        title: "Matvaretabellen · Broccoli, Norwegian, raw",
        url: "https://www.matvaretabellen.no/en/broccoli-norwegian-raw/",
        recordId: "06.018",
        checkedAt: "2026-11-19",
      },
    }],
  },
  {
    id: "butter",
    name: "Сливочное масло 82%",
    allergens: ["milk"],
    nutrition: [{
      state: "ready",
      per100g: { calories: 744, protein: 1, fat: 82, carbohydrates: 0.5 },
      source: {
        title: "Matvaretabellen · Butter",
        url: "https://www.matvaretabellen.no/en/butter/",
        recordId: "08.005",
        checkedAt: "2026-11-19",
      },
    }],
  },
  {
    id: "walnuts",
    name: "Грецкие орехи, очищенные ядра",
    allergens: ["walnut"],
    nutrition: [{
      state: "ready",
      per100g: { calories: 680, protein: 14.1, fat: 66.5, carbohydrates: 2.8 },
      source: {
        title: "Matvaretabellen · Walnuts",
        url: "https://www.matvaretabellen.no/en/walnuts/",
        recordId: "06.560",
        checkedAt: "2026-11-19",
      },
    }],
  },
  {
    id: "rapeseed-oil",
    name: "Рапсовое масло",
    nutrition: [{
      state: "ready",
      per100g: { calories: 892, protein: 0.2, fat: 99, carbohydrates: 0 },
      source: {
        title: "Matvaretabellen · Oil, rapeseed",
        url: "https://www.matvaretabellen.no/en/oil-rapeseed/",
        recordId: "08.235",
        checkedAt: "2026-11-19",
      },
    }],
  },
  // POR-011: quantities refer to edible parts; do not apply purchase waste factors again.
  {
    id: "red-lentils",
    name: "Чечевица красная, сухая",
    nutrition: [
      {
        state: "dry",
        per100g: {
          calories: 274,
          protein: 22.5,
          fat: 2.2,
          carbohydrates: 31.9
        },
        source: {
          title: "Matvaretabellen · Lentils, red, uncooked",
          url: "https://www.matvaretabellen.no/en/lentils-red-uncooked/",
          recordId: "06.184",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
  {
    id: "onion",
    name: "Лук репчатый, очищенный",
    nutrition: [
      {
        state: "raw",
        per100g: {
          calories: 30,
          protein: 1,
          fat: 0,
          carbohydrates: 4.4
        },
        source: {
          title: "Matvaretabellen · Onion, Norwegian, raw",
          url: "https://www.matvaretabellen.no/en/onion-norwegian-raw/",
          recordId: "06.042",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
  {
    id: "carrot",
    name: "Морковь, съедобная часть",
    nutrition: [
      {
        state: "raw",
        per100g: {
          calories: 25,
          protein: 0,
          fat: 0,
          carbohydrates: 5.3
        },
        source: {
          title: "Matvaretabellen · Carrot, Norwegian, raw",
          url: "https://www.matvaretabellen.no/en/carrot-norwegian-raw/",
          recordId: "06.036",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
  {
    id: "garlic",
    name: "Чеснок, очищенный",
    nutrition: [
      {
        state: "raw",
        per100g: {
          calories: 106,
          protein: 7.9,
          fat: 0.6,
          carbohydrates: 16.3
        },
        source: {
          title: "Matvaretabellen · Garlic, raw",
          url: "https://www.matvaretabellen.no/en/garlic-raw/",
          recordId: "06.038",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
  {
    id: "canned-tomatoes",
    name: "Томаты консервированные в собственном соку, с соком",
    nutrition: [
      {
        state: "ready",
        per100g: {
          calories: 21,
          protein: 0.8,
          fat: 0.2,
          carbohydrates: 3.3
        },
        source: {
          title: "Matvaretabellen · Tomato, canned",
          url: "https://www.matvaretabellen.no/en/tomato-canned/",
          recordId: "06.070",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
  {
    id: "wheat-pasta",
    name: "Макароны пшеничные, сухие, без яйца",
    allergens: ["wheat"],
    nutrition: [
      {
        state: "dry",
        per100g: {
          calories: 347,
          protein: 11.9,
          fat: 1.3,
          carbohydrates: 69.8
        },
        source: {
          title: "Matvaretabellen · Pasta, plain, uncooked",
          url: "https://www.matvaretabellen.no/en/pasta-plain-uncooked/",
          recordId: "05.016",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
  {
    id: "ground-beef-4-5",
    name: "Фарш говяжий 4,5% жирности",
    nutrition: [
      {
        state: "raw",
        per100g: {
          calories: 123,
          protein: 20.7,
          fat: 4.5,
          carbohydrates: 0
        },
        source: {
          title: "Matvaretabellen · Beef, minced meat, 4,5 % fat, raw",
          url: "https://www.matvaretabellen.no/en/beef-minced-meat-4-5-fat-raw/",
          recordId: "03.126",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
  {
    id: "wild-cod",
    name: "Треска атлантическая дикая, филе без кожи и костей",
    allergens: ["fish"],
    nutrition: [
      {
        state: "raw",
        per100g: {
          calories: 79,
          protein: 17.4,
          fat: 1,
          carbohydrates: 0
        },
        source: {
          title: "Matvaretabellen · Cod, wild, raw",
          url: "https://www.matvaretabellen.no/en/cod-wild-raw/",
          recordId: "04.038",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
  {
    id: "potatoes",
    name: "Картофель для хранения, очищенный",
    nutrition: [
      {
        state: "raw",
        per100g: {
          calories: 80,
          protein: 1.9,
          fat: 0.1,
          carbohydrates: 17.1
        },
        source: {
          title: "Matvaretabellen · Potatoes, storage, raw",
          url: "https://www.matvaretabellen.no/en/potatoes-storage-raw/",
          recordId: "06.004",
          checkedAt: "2026-11-26"
        }
      }
    ]
  },
];

// Demonstration compositions; preparation times are estimates, not measured data.
// No expected cooked yield is asserted without an appropriate source.
export const recipes: readonly Recipe[] = [
  {
    id: "banana-porridge",
    image: { src: "/recipes/banana-porridge-cutout.webp", alt: "Овсяная каша на молоке с размятым бананом в светлой керамической миске", origin: "ai" },
    name: "Овсяная каша с бананом и корицей",
    description: "Нежная молочная каша со сладким бананом, сливочным маслом и ароматом корицы.",
    category: "breakfast",
    baseServings: 2,
    activeMinutes: 7,
    totalMinutes: 15,
    components: [{
      id: "porridge",
      name: "Каша с бананом",
      seasonings: ["Корица", "Соль"],
      ingredients: [
        { productId: "rolled-oats", state: "dry", quantity: 120, unit: "g" },
        { productId: "milk", state: "ready", quantity: 500, unit: "ml" },
        { productId: "banana", state: "raw", quantity: 2, unit: "piece" },
        { productId: "butter", state: "ready", quantity: 10, unit: "g" },
      ],
    }],
    steps: [
      "Смешайте в кастрюле молоко, хлопья и соль по вкусу. На среднем огне доведите до слабого кипения.",
      "Убавьте огонь и варите, помешивая, 7–10 минут до мягкости хлопьев. Если на упаковке указано другое время, следуйте ему.",
      "Пока варится каша, очистите бананы. Часть разомните вилкой, остальное нарежьте. Вмешайте размятый банан и масло в кашу, разложите по порциям, добавьте нарезанный банан и корицу по вкусу.",
    ],
  },
  {
    id: "banana-yoghurt",
    image: { src: "/recipes/banana-yoghurt-cutout.webp", alt: "Натуральный йогурт с овсяными хлопьями, нарезанным бананом, грецкими орехами и корицей в светлой миске", origin: "ai" },
    name: "Йогурт с бананом и грецкими орехами",
    description: "Густой йогурт с мягким бананом, овсяными хлопьями и хрустящими грецкими орехами. Завтрак без плиты.",
    category: "breakfast",
    baseServings: 2,
    activeMinutes: 5,
    totalMinutes: 10,
    components: [{
      id: "yoghurt-bowl",
      name: "Йогурт с бананом и грецкими орехами",
      seasonings: ["Корица"],
      ingredients: [
        { productId: "yoghurt", state: "ready", quantity: 300, unit: "g" },
        { productId: "banana", state: "raw", quantity: 2, unit: "piece" },
        { productId: "rolled-oats", state: "dry", quantity: 60, unit: "g" },
        { productId: "walnuts", state: "ready", quantity: 20, unit: "g" },
      ],
    }],
    steps: [
      "Смешайте йогурт, хлопья и корицу по вкусу. Используйте хлопья, которые производитель разрешает есть без варки.",
      "Очистите и нарежьте бананы, крупно порубите орехи. Добавьте в йогурт и перемешайте.",
      "Оставьте примерно на 5 минут, чтобы хлопья размягчились. Разделите на порции и подавайте.",
    ],
  },
  {
    id: "chicken-rice-vegetables",
    image: { src: "/recipes/chicken-rice-vegetables-cutout.webp", alt: "Запечённая куриная грудка с паприкой, белый рис и подрумяненная брокколи отдельными компонентами на светлой тарелке", origin: "ai" },
    name: "Запечённая курица с рисом и брокколи",
    description: "Курица с паприкой, рассыпчатый рис и подрумяненная брокколи. Мясо и овощи запекаются вместе, пока варится гарнир.",
    category: "lunch",
    baseServings: 2,
    activeMinutes: 15,
    totalMinutes: 40,
    components: [
      {
        id: "chicken",
        name: "Куриная грудка",
        seasonings: ["Паприка", "Соль", "Чёрный перец"],
        ingredients: [
          { productId: "chicken-breast", state: "raw", quantity: 400, unit: "g" },
          { productId: "rapeseed-oil", state: "ready", quantity: 10, unit: "g" },
        ],
      },
      {
        id: "rice",
        name: "Рис",
        seasonings: ["Соль"],
        ingredients: [{ productId: "white-rice", state: "dry", quantity: 160, unit: "g" }],
      },
      {
        id: "vegetables",
        name: "Запечённая брокколи",
        seasonings: ["Соль", "Чёрный перец"],
        ingredients: [
          { productId: "broccoli", state: "raw", quantity: 400, unit: "g" },
          { productId: "rapeseed-oil", state: "ready", quantity: 5, unit: "g" },
        ],
      },
    ],
    safetyNote: "После сырой курицы вымойте руки и инвентарь, не допускайте контакта её соков с готовой едой. Время запекания — ориентир. Для надёжной проверки рекомендуем термометр: не менее 74 °C в самой толстой части курицы. Цвет мяса сам по себе не подтверждает безопасность. Если овощи соприкасались с сырыми куриными соками, их также нужно полностью прогреть до 74 °C; не снимайте их раньше готовности.",
    steps: [
      "Разогрейте духовку до 200 °C, верх/низ. Разберите брокколи на небольшие соцветия. Толстые куски грудки разрежьте вдоль до толщины около 2 см.",
      "Смешайте курицу с её маслом, паприкой, солью и перцем по вкусу. Брокколи перемешайте с её маслом, солью и перцем. Разложите отдельно на одном противне, в двух бортиках из фольги, чтобы соки не смешивались.",
      "Запекайте курицу ориентировочно 20–25 минут до полной готовности, брокколи — 15–20 минут до мягкости и лёгкого подрумянивания. Овощи можно достать раньше, если они готовы и не соприкасались с сырыми куриными соками. Проверьте готовность курицы по рекомендации ниже.",
      "Пока работает духовка, промойте рис, добавьте воду и соль по вкусу. Варите под крышкой на слабом огне примерно 15–20 минут, затем оставьте без нагрева ещё на 5 минут. Количество воды и время на упаковке вашего риса имеют приоритет.",
      "Нарежьте готовую курицу и подайте с рисом и брокколи. Каждый компонент распределите отдельно.",
    ],
  },
  {
    id: "lentil-vegetable-stew",
    image: { src: "/recipes/lentil-vegetable-stew-cutout.webp", alt: "Густое чечевичное рагу с морковью и томатами в светлой миске", origin: "ai" },
    name: "Чечевичное рагу с овощами",
    description: "Густое рагу из красной чечевицы, моркови и томатов с чесноком и паприкой.",
    category: "dinner",
    baseServings: 2,
    activeMinutes: 15,
    totalMinutes: 55,
    components: [
      {
        id: "stew",
        name: "Чечевичное рагу",
        ingredients: [
          {
            productId: "red-lentils",
            state: "dry",
            quantity: 160,
            unit: "g"
          },
          {
            productId: "carrot",
            state: "raw",
            quantity: 150,
            unit: "g"
          },
          {
            productId: "onion",
            state: "raw",
            quantity: 100,
            unit: "g"
          },
          {
            productId: "garlic",
            state: "raw",
            quantity: 6,
            unit: "g"
          },
          {
            productId: "canned-tomatoes",
            state: "ready",
            quantity: 300,
            unit: "g"
          },
          {
            productId: "rapeseed-oil",
            state: "ready",
            quantity: 15,
            unit: "g"
          }
        ],
        seasonings: [
          "Паприка",
          "Молотый кумин",
          "Соль",
          "Чёрный перец"
        ]
      }
    ],
    steps: [
      "Переберите и промойте чечевицу. Взвесьте овощи после очистки: мелко нарежьте лук, нарежьте морковь небольшими кубиками, измельчите чеснок.",
      "В кастрюле с толстым дном нагрейте масло. Готовьте лук и морковь на среднем огне около 7–8 минут, помешивая.",
      "Добавьте чеснок, паприку и кумин по вкусу, перемешивайте около 30 секунд.",
      "Добавьте чечевицу и начальные 500 мл питьевой воды для двух базовых порций. Доведите до кипения и готовьте до мягкости, ориентировочно 25–30 минут. Инструкция выбранной чечевицы имеет приоритет. Следите, чтобы смесь не выкипела; при необходимости добавляйте горячую воду. Количество воды не задаёт выход готового блюда.",
      "Добавьте томаты вместе с соком, разомните крупные куски. Тушите ещё около 10 минут до желаемой густоты. Посолите, поперчите и перемешайте перед распределением рагу."
    ],
    safetyNote: "Используйте промытые овощи, чистый инвентарь и полностью приготовленную чечевицу. Чечевица не объявляется гипоаллергенной: проверяйте состав и предупреждения на упаковках. Время — предварительная оценка без контрольной готовки. При изменении объёма воду и время уточняйте по консистенции и инструкции продукта."
  },
  {
    id: "pasta-beef-tomato",
    image: { src: "/recipes/pasta-beef-tomato-cutout.webp", alt: "Пшеничные макароны пенне и густой томатный соус с говяжьим фаршем на светлой тарелке", origin: "ai" },
    name: "Паста с томатным соусом и говядиной",
    description: "Макароны с густым соусом из нежирного говяжьего фарша, томатов и овощей. Макароны и соус распределяются отдельно.",
    category: "lunch",
    baseServings: 2,
    activeMinutes: 20,
    totalMinutes: 45,
    components: [
      {
        id: "pasta",
        name: "Макароны",
        ingredients: [
          {
            productId: "wheat-pasta",
            state: "dry",
            quantity: 160,
            unit: "g"
          }
        ],
        seasonings: [
          "Соль"
        ]
      },
      {
        id: "meat-sauce",
        name: "Мясной соус",
        ingredients: [
          {
            productId: "ground-beef-4-5",
            state: "raw",
            quantity: 300,
            unit: "g"
          },
          {
            productId: "canned-tomatoes",
            state: "ready",
            quantity: 400,
            unit: "g"
          },
          {
            productId: "onion",
            state: "raw",
            quantity: 100,
            unit: "g"
          },
          {
            productId: "carrot",
            state: "raw",
            quantity: 100,
            unit: "g"
          },
          {
            productId: "garlic",
            state: "raw",
            quantity: 6,
            unit: "g"
          },
          {
            productId: "rapeseed-oil",
            state: "ready",
            quantity: 10,
            unit: "g"
          }
        ],
        seasonings: [
          "Сушёный орегано",
          "Соль",
          "Чёрный перец"
        ]
      }
    ],
    steps: [
      "Взвесьте овощи после очистки. Мелко нарежьте лук, натрите морковь, измельчите чеснок.",
      "Нагрейте масло в глубокой сковороде. Готовьте лук и морковь около 5–7 минут.",
      "Добавьте говяжий фарш 4,5% жирности. Готовьте примерно 7–10 минут, тщательно разбивая комки. Добавьте чеснок на последнюю минуту.",
      "Влейте томаты вместе с соком, добавьте орегано по вкусу. Тушите при слабом кипении примерно 15–20 минут, периодически перемешивая. При необходимости добавьте немного воды. Жир и сок соуса не сливайте: они входят в расчётный состав.",
      "Пока тушится соус, сварите макароны в воде по инструкции упаковки. Слейте воду. Используйте сухие пшеничные макароны без яйца; проверяйте состав упаковки.",
      "Проверьте готовность фарша по рекомендации ниже. Раскладывайте макароны и мясной соус отдельно, соединяя в тарелке. Ингредиенты внутри соуса распределяются совместно."
    ],
    safetyNote: "После работы с сырым фаршем вымойте руки и инвентарь; не допускайте контакта сырого мяса и его соков с готовой едой. Для надёжной проверки рекомендуем термометр: не менее 71 °C в фарше. Цвет мяса и минуты приготовления не заменяют измерение температуры. Пшеничные макароны содержат глютен; проверяйте состав и предупреждения упаковки. Время — предварительная оценка без контрольной готовки."
  },
  {
    id: "cod-potatoes-broccoli",
    image: { src: "/recipes/cod-potatoes-broccoli-cutout.webp", alt: "Запечённое филе трески, золотистый картофель и брокколи отдельными компонентами на светлой тарелке", origin: "ai" },
    name: "Запечённая треска с картофелем и брокколи",
    description: "Нежное филе трески с картофелем, паприкой и отдельно запечённой брокколи. Три компонента для отдельного распределения.",
    category: "dinner",
    baseServings: 2,
    activeMinutes: 15,
    totalMinutes: 55,
    components: [
      {
        id: "fish",
        name: "Треска",
        ingredients: [
          {
            productId: "wild-cod",
            state: "raw",
            quantity: 400,
            unit: "g"
          },
          {
            productId: "rapeseed-oil",
            state: "ready",
            quantity: 5,
            unit: "g"
          }
        ],
        seasonings: [
          "Сушёный укроп",
          "Соль",
          "Чёрный перец"
        ]
      },
      {
        id: "potatoes",
        name: "Картофель",
        ingredients: [
          {
            productId: "potatoes",
            state: "raw",
            quantity: 500,
            unit: "g"
          },
          {
            productId: "rapeseed-oil",
            state: "ready",
            quantity: 10,
            unit: "g"
          }
        ],
        seasonings: [
          "Паприка",
          "Соль",
          "Чёрный перец"
        ]
      },
      {
        id: "vegetables",
        name: "Запечённая брокколи",
        ingredients: [
          {
            productId: "broccoli",
            state: "raw",
            quantity: 300,
            unit: "g"
          },
          {
            productId: "rapeseed-oil",
            state: "ready",
            quantity: 5,
            unit: "g"
          }
        ],
        seasonings: [
          "Соль",
          "Чёрный перец"
        ]
      }
    ],
    steps: [
      "Если филе заморожено, заранее разморозьте его в холодильнике. Размораживание не входит в оценку времени. Взвесьте 400 г размороженного сырого филе без кожи и костей для двух базовых порций.",
      "Разогрейте духовку до 200 °C, верх/низ. Взвесьте картофель после очистки, нарежьте кусочками около 2 см.",
      "Перемешайте картофель с его маслом, паприкой и солью по вкусу. Разложите одним слоем и запекайте около 25 минут.",
      "Разберите брокколи на небольшие соцветия и перемешайте с её маслом. Рыбу обсушите, проверьте на оставшиеся кости, смажьте её маслом, добавьте сушёный укроп и соль по вкусу.",
      "Перемешайте картофель. Поставьте рыбу в отдельной небольшой форме, брокколи — отдельно от рыбы и её соков. Продолжайте запекание ориентировочно 15–20 минут. Картофель должен стать мягким; время рыбы зависит от толщины филе.",
      "Проверьте температуру рыбы в наиболее толстой части по рекомендации ниже. Распределяйте рыбу, картофель и брокколи отдельно. Сок из формы подавайте вместе с рыбой. Оценка времени предполагает одновременное размещение компонентов; при нескольких заходах время увеличится."
    ],
    safetyNote: "Рыба — известный аллерген. Размораживайте филе в холодильнике. После сырой рыбы вымойте руки и инвентарь; её соки не должны попадать на готовую еду. Для надёжной проверки рекомендуем термометр: не менее 63 °C в самой толстой части филе. Время и внешний вид не гарантируют готовность. Время — предварительная оценка без контрольной готовки."
  },
];
