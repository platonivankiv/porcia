"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FamilyMember } from "../family/model";
import { loadFamily, type FamilyLoadResult } from "../family/storage";
import { calculateMemberPortions } from "./calculate-member-portions";
import { calculateRecipe } from "./calculate-recipe";
import { parseComponentPortionInput } from "./component-portion-input";
import type { MemberRecipePortion, Product, Recipe } from "./model";
import { formatIngredientQuantity, stateLabels } from "./recipe-format";
import { NutritionFacts } from "./recipe-ui";

export function FamilyRecipePortions({ recipe, products }: { recipe: Recipe; products: readonly Product[] }) {
  const [loaded, setLoaded] = useState<FamilyLoadResult | null>(null);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoaded(loadFamily(() => window.localStorage, products.map((product) => product.id)));
    });
    return () => { active = false; };
  }, [products]);

  return <section className="family-recipe-portions" aria-labelledby="family-portions-heading">
    <h2 id="family-portions-heading">Порции семьи</h2>
    <p>Выберите участников и задайте количество каждого компонента вручную. Дневные ориентиры не меняются.</p>
    <p className="recipe-small">Это черновик: назначения сбросятся после перезагрузки или ухода со страницы. Ограничения участников автоматически не проверяются; нулевая порция не подтверждает аллергенную безопасность.</p>
    {!loaded ? <p role="status">Загружаем участников…</p>
      : !loaded.ok ? <div className="family-panel">
        <p role="alert">{loaded.message}</p>
        <button className="family-text-button" onClick={() => setLoaded(loadFamily(() => window.localStorage, products.map((product) => product.id)))}>Повторить чтение</button>
        <p><Link href="/family">Открыть семейные профили</Link></p>
      </div>
      : !loaded.document?.members.length ? <div className="recipe-empty">
        <h3>Добавьте участников семьи</h3>
        <p>Для ручного назначения порций достаточно профиля с именем.</p>
        <Link className="recipe-button" href="/family">Открыть семейные профили</Link>
      </div>
      : <FamilyPortionsEditor recipe={recipe} products={products} members={loaded.document.members} />}
  </section>;
}

export function FamilyPortionsEditor({ recipe, products, members }: {
  recipe: Recipe;
  products: readonly Product[];
  members: readonly FamilyMember[];
}) {
  // Text stays in React; only complete, validated assignments reach the calculator.
  const [drafts, setDrafts] = useState<ReadonlyMap<string, ReadonlyMap<string, string>>>(new Map());
  const base = calculateRecipe(recipe, products, 1);
  if (!base.ok) return <p role="alert">Расчёт порций недоступен: {base.reason}</p>;

  const selected = members.filter((member) => drafts.has(member.id)).map((member) => {
    const fields = recipe.components.map((component) => ({
      componentId: component.id,
      input: parseComponentPortionInput(drafts.get(member.id)?.get(component.id) ?? ""),
    }));
    const components: MemberRecipePortion["components"][number][] = [];
    for (const field of fields) {
      if (field.input.status === "valid") components.push({ componentId: field.componentId, baseServings: field.input.value });
    }
    const portion = { memberId: member.id, components };
    const result = components.length === recipe.components.length ? calculateMemberPortions(recipe, products, [portion]) : null;
    return { member, fields, portion, result };
  });
  const family = selected.length && selected.every(({ result }) => result?.ok)
    ? calculateMemberPortions(recipe, products, selected.map(({ portion }) => portion)) : null;

  return <>
    <div className="family-panel portion-basis">
      <h3>Что означает 1 базовая порция</h3>
      <p className="recipe-small">Количество каждого компонента измеряется отдельно: 0 — не включать, 0,5 — половина указанного состава, 1 — весь указанный состав. Это исходные ингредиенты, а не масса готового блюда. Выход после приготовления не определяется по их сумме.</p>
      <div className="portion-components">
        {base.components.map(({ component, ingredients }) => <div key={component.id} id={`portion-basis-${component.id}`}>
          <h4>{component.name}</h4>
          <ul className="recipe-ingredient-list">
            {ingredients.map(({ ingredient, product }, index) => <li key={index}>
              <span>{product.name} <span className="recipe-small">({stateLabels[ingredient.state].toLowerCase()})</span></span>
              <strong>{formatIngredientQuantity(ingredient, product)}</strong>
            </li>)}
            {component.seasonings?.map((seasoning) => <li key={seasoning}><span>{seasoning}</span><strong>по вкусу</strong></li>)}
          </ul>
        </div>)}
      </div>
    </div>
    <fieldset className="family-food-fields">
      <legend>Кто будет есть</legend>
      <div className="portion-members">
        {members.map((member) => <label className="family-checkbox" key={member.id}>
          <input type="checkbox" checked={drafts.has(member.id)} onChange={(event) => {
            const checked = event.target.checked;
            setDrafts((previous) => {
              const next = new Map(previous);
              if (checked) next.set(member.id, new Map());
              else next.delete(member.id);
              return next;
            });
          }} />{member.displayName}
        </label>)}
      </div>
    </fieldset>
    {!selected.length && <p className="recipe-small">Выберите хотя бы одного участника. Размеры порций автоматически не назначаются.</p>}
    {selected.map(({ member, fields, result }) => <fieldset className="family-panel portion-member" key={member.id}>
      <legend>{member.displayName}</legend>
      <div className="portion-components">
        {fields.map(({ componentId, input }) => {
          const component = recipe.components.find((item) => item.id === componentId)!;
          const id = `portion-${member.id}-${componentId}`;
          return <div className="family-field" key={componentId}>
            <label htmlFor={id}>{component.name} — базовых порций</label>
            <input id={id} type="text" inputMode="decimal" autoComplete="off" spellCheck={false}
              value={drafts.get(member.id)?.get(componentId) ?? ""} aria-invalid={input.status === "invalid"}
              aria-describedby={`portion-basis-${componentId} ${id}-feedback`}
              onChange={(event) => {
                const value = event.target.value;
                setDrafts((previous) => {
                  const next = new Map(previous);
                  const quantities = new Map(previous.get(member.id));
                  quantities.set(componentId, value);
                  next.set(member.id, quantities);
                  return next;
                });
              }} />
            <p className={input.status === "invalid" ? "family-field-error" : "recipe-small"} id={`${id}-feedback`}>
              {input.status === "invalid" ? input.message : input.status === "empty" ? "Укажите количество, включая 0 для отсутствующего компонента." : "Состав одной базовой порции указан выше."}
            </p>
          </div>;
        })}
      </div>
      <div className="portion-result" aria-live="polite">
        {result?.ok ? <><h3>КБЖУ порции: {member.displayName}</h3><NutritionFacts value={result.members[0].nutrition} label={`КБЖУ порции: ${member.displayName}`} /></>
          : <p>{result && !result.ok ? result.reason : "Заполните все компоненты корректно, чтобы увидеть полные КБЖУ участника."}</p>}
      </div>
    </fieldset>)}
    {selected.length > 0 && <section className="family-panel portion-family" aria-labelledby="family-ingredients-heading">
      <h3 id="family-ingredients-heading">Исходные ингредиенты для семьи</h3>
      <p className="recipe-small">Только для выбранных участников. Отдельный калькулятор общих порций выше на этот расчёт не влияет. КБЖУ — оценка по ингредиентам, без моделирования потерь при готовке; приправы по вкусу не учитываются.</p>
      {!family?.ok ? <p role="status">{family && !family.ok ? family.reason : "Общий расчёт появится, когда все выбранные участники получат корректные назначения каждого компонента."}</p>
        : <div className="portion-components">{family.components.map(({ componentId, baseServings, ingredients }) => <div key={componentId}>
          <h4>{recipe.components.find((component) => component.id === componentId)!.name}</h4>
          {baseServings === 0 ? <p>Не включён в назначения.</p> : <ul className="recipe-ingredient-list">
            {ingredients.map(({ ingredient, product }, index) => <li key={index}><span>{product.name} <span className="recipe-small">({stateLabels[ingredient.state].toLowerCase()})</span></span><strong>{formatIngredientQuantity(ingredient, product)}</strong></li>)}
            {recipe.components.find((component) => component.id === componentId)!.seasonings?.map((seasoning) => <li key={seasoning}><span>{seasoning}</span><strong>по вкусу</strong></li>)}
          </ul>}
        </div>)}</div>}
    </section>}
  </>;
}
