export type ProductState = 'dry' | 'raw' | 'ready' | 'cooked'
export type IngredientUnit = 'g' | 'ml' | 'piece'

export type Nutrition = Readonly<{
	calories: number
	protein: number
	fat: number
	carbohydrates: number
}>

export type ProductNutrition = Readonly<{
	state: ProductState
	per100g: Partial<Nutrition>
	source: {
		title: string
		url: string
		recordId: string
		checkedAt: string
	}
}>

export type Product = Readonly<{
	id: string
	name: string
	nutrition: readonly ProductNutrition[]
	gramsPerUnit?: readonly {
		state: ProductState
		unit: Exclude<IngredientUnit, 'g'>
		grams: number
		pieceLabels?: readonly [one: string, few: string, many: string]
		source?: Readonly<{
			title: string
			url: string
			checkedAt: string
			note: string
		}>
	}[]
}>

export type RecipeIngredient = Readonly<{
	productId: string
	state: ProductState
	quantity: number
	unit: IngredientUnit
}>

export type RecipeComponent = Readonly<{
	id: string
	name: string
	ingredients: readonly RecipeIngredient[]
	expectedYieldGrams?: number
}>

export type Recipe = Readonly<{
	id: string
	name: string
	description: string
	category?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
	image?: Readonly<{
		src: string
		alt: string
		origin: 'ai' | 'photo'
	}>
	baseServings: number
	components: readonly RecipeComponent[]
	steps: readonly string[]
	activeMinutes?: number
	totalMinutes?: number
}>
