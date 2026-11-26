# Изображения рецептов Porcia

## Новые изображения — POR-011.2

Созданы 26 ноября 2026 года встроенным OpenAI Image Generation по согласованным составам. Это **AI-иллюстрации**, а не фотографии приготовленных блюд. Сторонние стоки и внешние изображения-референсы не использовались; стиль задан текстовыми промптами по существующей коллекции Bold Food Editorial: светлая посуда с волнистым краем, крупная еда и прозрачный фон.

- `lentil-vegetable-stew-cutout.webp` — смешанное рагу из красной чечевицы, моркови, лука, чеснока, томатов и рапсового масла с приправами.
- `pasta-beef-tomato-cutout.webp` — пенне и мясной соус из говядины, томатов, лука, моркови, чеснока и рапсового масла с орегано; без сыра и свежей зелени.
- `cod-potatoes-broccoli-cutout.webp` — запечённая треска с сушёным укропом, картофель с паприкой и брокколи; масло распределено по трём компонентам; без лимона и соуса.

Исходные PNG сохранены в рабочем пространстве генерации. У рагу и трески выполнена дополнительная генеративная правка области вокруг посуды; исходные и финальные имена PNG записаны в provenance. Финальные изображения оптимизированы установленным `sharp`: WebP, ширина 800 px, quality 90, alpha quality 100, альфа-канал сохранён. Размеры: рагу и треска 800 × 533, паста 800 × 600. Новых зависимостей нет.

Полные промпты генерации и правки, сведения об обработке и SHA-256 файлов: [POR-011-PROVENANCE.json](/recipes/POR-011-PROVENANCE.json). Иллюстрации не подтверждают размер порций, готовый выход, пищевую ценность, аллергенную безопасность или готовность еды. Основание использования и прежняя история коллекции сохранены ниже.

## Изображения POR-DESIGN-002

Три действующих WebP перенесены 25 ноября 2026 года из утверждённого прототипа POR-DESIGN-001 A/v3. Они созданы 23 ноября 2026 года встроенным OpenAI Image Generation. Это **AI-иллюстрации**, а не фотографии приготовленных блюд. URL рецептов сохранены. У новых изображений отдельные URL с суффиксом `-cutout`, чтобы кеш оптимизатора Next.js не выдавал прежние фотографии. Старые изображения оставлены для совместимости ссылок.

- `banana-porridge-cutout.webp` — овсяная каша на молоке с бананом, сливочным маслом и корицей; часть банана смешана с кашей, часть показана ломтиками.
- `banana-yoghurt-cutout.webp` — натуральный йогурт, овсяные хлопья, банан, грецкие орехи и корица.
- `chicken-rice-vegetables-cutout.webp` — отдельно поданные куриная грудка с паприкой, белый рис и запечённая брокколи с рапсовым маслом.

Состав соответствует существующим рецептам. Изображения не подтверждают размер базовой или индивидуальной порции, выход, КБЖУ, аллергенную безопасность или готовность блюда.

Исходные PNG имеют прозрачный фон; перенесены утверждённые WebP 800 × 731 с сохранённым альфа-каналом (качество 90, alpha quality 100), без изменения пикселей этих WebP. В интерфейсе используется `object-fit: contain`, чтобы посуда не обрезалась. Сторонние стоковые изображения не использовались. Новые изображения в POR-DESIGN-002 не генерировались.

Полные промпты и сведения о происхождении: [PROVENANCE.json](/recipes/PROVENANCE.json). Абсолютные локальные пути в публичные сведения не включены. Исходники PNG остаются в изолированном прототипе.

Ниже сохранена история предыдущих иллюстраций. Описанные в ней файлы сохранены для совместимости ссылок, но каталог использует новые `-cutout` URL; старые промпты не описывают действующие иллюстрации.

---

# Предыдущие изображения POR-003–POR-006 (история)

Иллюстрация каши создана 18 ноября 2026 года. Иллюстрации йогурта и курицы обновлены 19 ноября 2026 года встроенным инструментом OpenAI Image Generation по разрешению владельца в POR-006. Это фотореалистичные **AI-иллюстрации**, а не фотографии приготовленных блюд. Сторонние изображения и изображения-референсы при генерации не использовались.

- `banana-porridge.webp`: каша только из овсяных хлопьев, молока и размятого банана.
- `banana-yoghurt.webp`: натуральный йогурт, овсяные хлопья, нарезанный банан, грецкие орехи и корица.
- `chicken-rice-vegetables.webp`: отдельно поданные запечённая грудка с паприкой, белый длиннозёрный рис и подрумяненная брокколи с рапсовым маслом, без соуса и украшений.

Иллюстрации проверены на соответствие видимому составу. Изображения не подтверждают выход, размер порции, пищевую ценность или фактический результат приготовления.

## Условия использования и обработка

Основание использования — [OpenAI Terms of Use, раздел Content](https://openai.com/policies/terms-of-use/), проверено 2026-11-18. Условия предусматривают передачу пользователю прав OpenAI на Output в допустимых законом пределах; результат может быть неуникальным. Это не лицензия CC и не утверждение об исключительности авторских прав. Изображения нельзя выдавать за созданные человеком; происхождение обозначено в интерфейсе.

Исходники сгенерированы в PNG, 1536 × 1024. В проекте используются WebP с качеством 85, без ретуши и изменения состава. В интерфейсе выполняется адаптивное кадрирование через `object-fit: cover`. Новых зависимостей для конвертации не добавлялось: использован установленный `sharp` из дерева Next.js.

Рассмотренные стоковые изображения Wikimedia Commons и Pexels отклонены из-за дополнительных ингредиентов; их файлы в проект не включены.

## Промпты

### Каша

Use case: photorealistic-natural. Create a landscape 3:2 photorealistic food illustration for a family recipe application. ONE shallow matte ivory ceramic bowl of freshly cooked creamy rolled-oat porridge made ONLY with rolled oats, cow milk and mashed banana. Banana is mashed and mixed into the porridge, not a topping. Visible soft oat flakes, pale creamy warm beige texture, natural irregular surface. No toppings at all. Bowl centered and completely visible with generous crop-safe margin on a light warm stone kitchen table, quiet sage linen at one edge. 45 degree overhead camera, soft daylight from left, professional appetizing natural food photography, sharp detailed texture and gentle background falloff. No seeds, chia, nuts, honey, cinnamon, berries, chocolate, butter, herbs, whole fruit, text, logos, hands or people. This is an AI illustration of precisely these three ingredients, not a marketing banner.

### Йогурт — POR-006

Use case: photorealistic-natural. Landscape 3:2 food illustration for Porcia family recipe app. Single ivory ceramic bowl on warm beige stone table with sage linen, soft natural daylight, three-quarter overhead angle, bowl entirely visible with safe margins. Thick plain white yogurt mixed with ordinary rolled oat flakes and banana, with clearly visible sliced banana and roughly chopped WALNUT KERNELS distributed on top, subtle dusting of cinnamon. Ingredients ONLY yogurt, rolled oats, banana, walnuts, cinnamon. No honey, no granola, no berries, no other nuts, no herbs, no text, no people. Match calm realistic home breakfast editorial photography. This is an AI illustration, not an actual cooked portion.

### Курица — POR-006

Use case: photorealistic-natural. Landscape 3:2 editorial food illustration for Porcia family recipe app. One ivory ceramic dinner plate fully visible with margins, warm light beige stone tabletop and sage linen, natural window daylight, close three-quarter overhead. Exactly three SEPARATE components: sliced juicy fully cooked skinless chicken breast with warm red paprika seasoning and lightly golden roasted exterior; plain fluffy white long-grain rice; ROASTED broccoli florets with visibly browned crisp edges and green centers, lightly coated with rapeseed oil. Realistic ordinary home cooked dinner, restrained appetizing food photography. Ingredients ONLY chicken breast, rice, broccoli, rapeseed oil, paprika, salt, black pepper. No sauce, no lemon, no garlic, no herbs, no garnish, no extra vegetables, no text, no people, no utensils. AI illustration, not proof of real portion size.

Каша сохранена: смешанный банан соответствует допустимому способу подачи; масло может быть вмешано, корица добавляется по вкусу. Иллюстрации не подтверждают аллергенную безопасность, пищевые значения, готовность мяса или срок хранения.
