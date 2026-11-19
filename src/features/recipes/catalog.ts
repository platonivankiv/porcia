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
];

// Demonstration compositions; preparation times are estimates, not measured data.
// No expected cooked yield is asserted without an appropriate source.
export const recipes: readonly Recipe[] = [
  {
    id: "banana-porridge",
    image: { src: "/recipes/banana-porridge.webp", alt: "Овсяная каша на молоке с размятым бананом в светлой керамической миске", origin: "ai" },
    name: "Овсяная каша с бананом",
    description: "Хлопья на молоке и банан, размятый в готовую кашу. Один завтрак для общего стола.",
    category: "breakfast",
    baseServings: 2,
    activeMinutes: 5,
    totalMinutes: 15,
    components: [{
      id: "porridge",
      name: "Каша с бананом",
      ingredients: [
        { productId: "rolled-oats", state: "dry", quantity: 120, unit: "g" },
        { productId: "milk", state: "ready", quantity: 400, unit: "ml" },
        { productId: "banana", state: "raw", quantity: 2, unit: "piece" },
      ],
    }],
    steps: [
      "Отмерьте хлопья и молоко по актуальному списку ингредиентов. Очистите бананы.",
      "Смешайте хлопья с молоком в кастрюле. Доведите до слабого кипения и готовьте, помешивая, до мягкости хлопьев; ориентируйтесь на инструкцию на упаковке.",
      "Разомните банан, вмешайте в готовую кашу и разделите на выбранное количество порций.",
    ],
  },
  {
    id: "banana-yoghurt",
    image: { src: "/recipes/banana-yoghurt.webp", alt: "Натуральный йогурт с размятым бананом и овсяными хлопьями в светлой миске", origin: "ai" },
    name: "Йогурт с бананом и хлопьями",
    description: "Натуральный йогурт, овсяные хлопья и мягкий банан. Смешайте и подайте.",
    category: "breakfast",
    baseServings: 2,
    activeMinutes: 5,
    totalMinutes: 5,
    components: [{
      id: "yoghurt-bowl",
      name: "Йогурт с бананом и хлопьями",
      ingredients: [
        { productId: "yoghurt", state: "ready", quantity: 300, unit: "g" },
        { productId: "banana", state: "raw", quantity: 2, unit: "piece" },
        { productId: "rolled-oats", state: "dry", quantity: 60, unit: "g" },
      ],
    }],
    steps: [
      "Отмерьте йогурт и хлопья по актуальному списку ингредиентов. Очистите бананы. Для этого блюда возьмите хлопья, которые по инструкции производителя подходят для употребления без варки.",
      "Разомните банан вилкой и смешайте с йогуртом и хлопьями.",
      "Разделите смесь на выбранное количество порций и подайте.",
    ],
  },
  {
    id: "chicken-rice-vegetables",
    image: { src: "/recipes/chicken-rice-vegetables.webp", alt: "Запечённая куриная грудка, белый рис и брокколи на пару отдельными компонентами на светлой тарелке", origin: "ai" },
    name: "Куриная грудка с рисом и овощами",
    description: "Куриная грудка, рассыпчатый рис и брокколи на пару. Три компонента одного семейного обеда.",
    category: "lunch",
    baseServings: 2,
    activeMinutes: 15,
    totalMinutes: 40,
    components: [
      {
        id: "chicken",
        name: "Куриная грудка",
        ingredients: [{ productId: "chicken-breast", state: "raw", quantity: 400, unit: "g" }],
      },
      {
        id: "rice",
        name: "Рис",
        ingredients: [{ productId: "white-rice", state: "dry", quantity: 160, unit: "g" }],
      },
      {
        id: "vegetables",
        name: "Овощи на пару",
        ingredients: [{ productId: "broccoli", state: "raw", quantity: 400, unit: "g" }],
      },
    ],
    steps: [
      "Подготовьте грудку без кожи и костей, сухой рис и очищенную съедобную часть брокколи по актуальному списку ингредиентов. Для сырой курицы используйте отдельную доску и вымойте руки и инвентарь после работы с ней.",
      "Разогрейте духовку до 200 °C. Положите грудку в пакет из пергамента и запекайте без масла до готовности. Проверьте пищевым термометром: температура в самой толстой части должна достигнуть 74 °C. Время зависит от толщины филе и объёма приготовления.",
      "Промойте рис и сварите в воде по инструкции на упаковке. Количество воды и время варки выбирайте для вашего риса; готовый выход заранее не предполагается.",
      "Разберите брокколи на соцветия и приготовьте на пару до желаемой мягкости.",
      "Нарежьте готовую грудку и подайте с рисом и брокколи, разделив каждый компонент на выбранное количество порций. Масло, соусы и другие добавки в этот рецепт и его КБЖУ не включены.",
    ],
  },
];
