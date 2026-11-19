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
];

// Demonstration compositions; preparation times are estimates, not measured data.
// No expected cooked yield is asserted without an appropriate source.
export const recipes: readonly Recipe[] = [
  {
    id: "banana-porridge",
    image: { src: "/recipes/banana-porridge.webp", alt: "Овсяная каша на молоке с размятым бананом в светлой керамической миске", origin: "ai" },
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
    image: { src: "/recipes/banana-yoghurt.webp", alt: "Натуральный йогурт с овсяными хлопьями, нарезанным бананом, грецкими орехами и корицей в светлой миске", origin: "ai" },
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
    image: { src: "/recipes/chicken-rice-vegetables.webp", alt: "Запечённая куриная грудка с паприкой, белый рис и подрумяненная брокколи отдельными компонентами на светлой тарелке", origin: "ai" },
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
];
