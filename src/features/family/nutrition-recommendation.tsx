import { calculateNutritionRecommendation, METHOD_VERSION, type CalculationInputs } from "./calculate-targets";

const amount = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

export function NutritionRecommendation({ inputs, live = false }: { inputs: CalculationInputs | null; live?: boolean }) {
  const result = inputs ? calculateNutritionRecommendation(inputs) : null;
  return <section className="family-recommendation" aria-label="Рекомендация по питанию" aria-live={live ? "polite" : undefined}>
    <h3>{!result || result.status === "unavailable" ? "Расчёт пока недоступен" : result.status === "partial" ? "Расчёт доступен частично" : "Рекомендованные КБЖУ"}</h3>
    {!result ? <p>Исправьте параметры профиля, чтобы увидеть актуальный расчёт.</p>
      : result.status === "unavailable" ? <p>{result.reason}</p> : <>
        <p className="recipe-small">Оценка расхода для поддержания: {amount.format(result.maintenanceCalories)} ккал/день. Это расчётная оценка, не назначение питания.</p>
        {result.status === "partial" ? <>
          {result.calories !== null && <p>Оценка энергии для выбранной цели: <strong>{amount.format(result.calories)} ккал/день</strong>.</p>}
          <p>{result.reason}</p>
          <p className="recipe-small">Полного набора КБЖУ нет. Недостающие показатели не заменены нулями.</p>
        </> : <>
          <dl className="family-summary family-target-summary">
            {([
              ["calories", "Энергия", "ккал"], ["protein", "Белки", "г"],
              ["fat", "Жиры", "г"], ["carbohydrates", "Углеводы", "г"],
            ] as const).map(([key, label, unit]) => <div key={key}><dt>{label} / день</dt><dd>{amount.format(result.values[key])} {unit}</dd></div>)}
          </dl>
          <p className="recipe-small">{result.energyFactor === 0.90 ? "Начальный дефицит 10%." : result.energyFactor === 1.05 ? "Начальный профицит 5%." : "Энергия поддержания."} Белок: {amount.format(result.proteinPerKg)} г/кг. Жиры: 30% энергии. Углеводы: остаток энергии.</p>
          {result.warnings.map((warning) => <p className="family-nutrition-note" key={warning}>{warning}</p>)}
        </>}
      </>}
    <p className="recipe-small">КБЖУ — расчётные ориентиры. Они не учитывают индивидуальные медицинские обстоятельства.</p>
    <details className="family-method"><summary>Как выполнен расчёт</summary>
      <p>Энергия поддержания оценивается по EER 2023 для взрослых от 19 лет. Общая активность уже включает тренировки; калории тренировок повторно не добавляются. Рекомпозиция использует поддержание энергии и отдельный белковый ориентир.</p>
      <p><a href="https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/equations-estimate-energy-requirement.html">Уравнения и категории активности — Health Canada</a>. Методика Porcia: {METHOD_VERSION}.</p>
    </details>
  </section>;
}
