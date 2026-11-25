import type { Product } from "../recipes/model";
import type { FamilyMember, FoodSubject } from "./model";
import { MemberAvatar } from "./member-avatar";
import { NutritionRecommendation } from "./nutrition-recommendation";
import { goalLabels } from "./validation";

export function MemberCard({ member, products, onEdit }: {
  member: FamilyMember;
  products: readonly Pick<Product, "id" | "name">[];
  onEdit: () => void;
}) {
  function subjectLabel(subject: FoodSubject) {
    return subject.kind === "description" ? subject.label : products.find((product) => product.id === subject.productId)?.name ?? subject.productId;
  }
  return <article className="family-member">
    <div className="family-member-visual">
      <div className="family-member-info">
        <h3>{member.displayName}</h3>
        <p className="family-member-goal">{member.goal ? member.goal === "maintenance" ? "Поддержание веса" : goalLabels[member.goal] : "Цель не выбрана"}</p>
        <p className="family-member-age">{member.ageYears === null ? "Возраст не указан" : `${member.ageYears} лет`}</p>
        <button className="family-button family-button-secondary" aria-label={`Редактировать: ${member.displayName}`} onClick={onEdit}>Изменить <span aria-hidden="true">↗</span></button>
      </div>
      <MemberAvatar avatarId={member.avatarId} displayName={member.displayName} />
    </div>
    <div className="family-member-facts">
      <NutritionRecommendation inputs={member} compact />
      <div className="family-member-tags" aria-label="Ограничения и предпочтения">
        {member.restrictions.status === "not-specified" ? <span>Ограничения не указаны</span>
          : member.restrictions.items.length ? member.restrictions.items.map((item, index) => <span key={index}>{item.kind === "allergy" ? "Аллергия" : "Исключение"}: {subjectLabel(item.subject)}</span>)
          : <span>Ограничения: раздел заполнен, записей нет</span>}
        {member.preferences.length ? member.preferences.map((item, index) => <span key={index}>{item.preference === "like" ? "Нравится" : "Не нравится"}: {subjectLabel(item.subject)}</span>)
          : <span>Предпочтения: 0</span>}
      </div>
    </div>
  </article>;
}
