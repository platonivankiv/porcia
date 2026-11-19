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
];
