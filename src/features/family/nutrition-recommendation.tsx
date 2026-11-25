import { calculationOptions } from "./validation";
import { calculateNutritionRecommendation, METHOD_VERSION, type CalculationInputs } from "./calculate-targets";

const amount = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

export function NutritionRecommendation({ inputs, live = false, compact = false }: { inputs: CalculationInputs | null; live?: boolean; compact?: boolean }) {
  const result = inputs ? calculateNutritionRecommendation(inputs) : null;
  const maintenance = result && result.status !== "unavailable" ? <p className="recipe-small">Оценка расхода для поддержания: {amount.format(result.maintenanceCalories)} ккал/день. Это расчётная оценка, не назначение питания.</p> : null;
  const distribution = result?.status === "complete" ? <p className="recipe-small">{result.energyFactor === 0.90 ? "Начальный дефицит 10%." : result.energyFactor === 1.05 ? "Начальный профицит 5%." : "Энергия поддержания."} Белок: {amount.format(result.proteinPerKg)} г/кг. Жиры: 30% энергии. Углеводы: остаток энергии.</p> : null;
  const disclaimer = <p className="recipe-small">КБЖУ — расчётные ориентиры. Они не учитывают индивидуальные медицинские обстоятельства.</p>;
  return <section className="family-recommendation" aria-label="Рекомендация по питанию" aria-live={live ? "polite" : undefined}>
    <h3 className={compact && result?.status === "complete" ? "sr-only" : undefined}>{compact && result?.status === "complete" ? "Ориентиры на день" : !result || result.status === "unavailable" ? "Расчёт пока недоступен" : result.status === "partial" ? "Расчёт доступен частично" : "Рекомендованные КБЖУ"}</h3>
    {!result ? <p>Исправьте параметры профиля, чтобы увидеть актуальный расчёт.</p>
      : result.status === "unavailable" ? <p>{result.reason}</p> : <>
        {(!compact || result.status === "partial") && maintenance}
        {result.status === "partial" ? <>
          {result.calories !== null && <p>Оценка энергии для выбранной цели: <strong>{amount.format(result.calories)} ккал/день</strong>.</p>}
          <p>{result.reason}</p>
          <p className="recipe-small">Полного набора КБЖУ нет. Недостающие показатели не заменены нулями.</p>
        </> : <>
          <dl className="family-summary family-target-summary">
            {([
              ["calories", "Энергия", "ккал"], ["protein", "Белки", "г"],
              ["fat", "Жиры", "г"], ["carbohydrates", "Углеводы", "г"],
            ] as const).map(([key, label, unit]) => <div key={key}><dt>{compact ? key === "calories" ? "Ориентиры на день" : label : `${label} / день`}</dt><dd>{amount.format(result.values[key])}<span> {unit}</span></dd></div>)}
          </dl>
          {!compact && distribution}
          {result.warnings.map((warning) => <p className="family-nutrition-note" key={warning}>{warning}</p>)}
        </>}
      </>}
    {!compact && disclaimer}
    <details className="family-method"><summary>{compact ? "Параметры и расчёт" : "Как выполнен расчёт"}</summary>
      {compact && inputs && <dl className="family-parameter-list">
        {[["Возраст", inputs.ageYears === null ? "Не указан" : `${amount.format(inputs.ageYears)} лет`],
          ["Рост", inputs.heightCm === null ? "Не указан" : `${amount.format(inputs.heightCm)} см`],
          ["Вес", inputs.weightKg === null ? "Не указан" : `${amount.format(inputs.weightKg)} кг`],
          ["Формула", inputs.calculation.sexForEquation ? calculationOptions.sexForEquation[inputs.calculation.sexForEquation] : "Не указана"],
          ["Активность", inputs.calculation.activity ? calculationOptions.activity[inputs.calculation.activity] : "Не указана"],
          ["Тренировки", inputs.calculation.training ? calculationOptions.training[inputs.calculation.training] : "Не указаны"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>}
      {compact && <>{disclaimer}{result?.status === "complete" && maintenance}{distribution}</>}
      <p>Энергия поддержания оценивается по EER 2023 для взрослых от 19 лет. Общая активность уже включает тренировки; калории тренировок повторно не добавляются. Рекомпозиция использует поддержание энергии и отдельный белковый ориентир.</p>
      <p><a href="https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/equations-estimate-energy-requirement.html">Уравнения и категории активности — Health Canada</a>. Методика Porcia: {METHOD_VERSION}.</p>
    </details>
  </section>;
}
