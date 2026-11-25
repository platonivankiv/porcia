import type { FamilyMember } from "./model";
import { NutritionRecommendation } from "./nutrition-recommendation";
import { goalLabels } from "./validation";

const amount = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 12 });

export function MemberCard({ member, onEdit }: { member: FamilyMember; onEdit: () => void }) {
  return <article className="family-member">
    <div className="family-member-visual">
      <h3>{member.displayName}</h3>
      <p className="family-member-goal">{member.goal ? goalLabels[member.goal] : "Цель не выбрана"}</p>
      <span className="family-monogram" aria-hidden="true">{Array.from(member.displayName.trim())[0]}</span>
      <p className="family-member-age">{member.ageYears === null ? "Возраст не указан" : `Возраст: ${member.ageYears} лет`}</p>
      <button className="family-button family-button-secondary" aria-label={`Редактировать: ${member.displayName}`} onClick={onEdit}>Изменить <span aria-hidden="true">↗</span></button>
    </div>
    <div className="family-member-facts">
      <NutritionRecommendation inputs={member} compact />
      <details className="family-method">
        <summary>Параметры участника</summary>
        <dl className="family-summary">
          {([
            ["Возраст", member.ageYears === null ? "Не указан" : `${member.ageYears} лет`],
            ["Рост", member.heightCm === null ? "Не указан" : `${amount.format(member.heightCm)} см`],
            ["Вес", member.weightKg === null ? "Не указан" : `${amount.format(member.weightKg)} кг`],
          ]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </details>
    </div>
    <p className="family-member-footer">{member.restrictions.status === "not-specified" ? "Ограничения не указаны" : `Раздел ограничений заполнен. Записей: ${member.restrictions.items.length}`}. Предпочтений: {member.preferences.length}.</p>
  </article>;
}
