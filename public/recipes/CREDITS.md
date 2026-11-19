# Изображения рецептов Porcia

Первые две иллюстрации созданы 18 ноября 2026 года, иллюстрация курицы с рисом — 19 ноября 2026 года встроенным инструментом OpenAI Image Generation по отдельному согласованию владельца проекта. Это фотореалистичные **AI-иллюстрации**, а не фотографии приготовленных блюд. Сторонние изображения и изображения-референсы при генерации не использовались.

- `banana-porridge.webp`: каша только из овсяных хлопьев, молока и размятого банана.
- `banana-yoghurt.webp`: натуральный йогурт, размятый банан и обычные овсяные хлопья.
- `chicken-rice-vegetables.webp`: отдельно поданные запечённая грудка без кожи, белый длиннозёрный рис и брокколи на пару, без масла, соуса и украшений.

Иллюстрации проверены на соответствие видимому составу. Изображения не подтверждают выход, размер порции, пищевую ценность или фактический результат приготовления.

## Условия использования и обработка

Основание использования — [OpenAI Terms of Use, раздел Content](https://openai.com/policies/terms-of-use/), проверено 2026-11-18. Условия предусматривают передачу пользователю прав OpenAI на Output в допустимых законом пределах; результат может быть неуникальным. Это не лицензия CC и не утверждение об исключительности авторских прав. Изображения нельзя выдавать за созданные человеком; происхождение обозначено в интерфейсе.

Исходники сгенерированы в PNG, 1536 × 1024. В проекте используются WebP с качеством 85, без ретуши и изменения состава. В интерфейсе выполняется адаптивное кадрирование через `object-fit: cover`. Новых зависимостей для конвертации не добавлялось: использован установленный `sharp` из дерева Next.js.

Рассмотренные стоковые изображения Wikimedia Commons и Pexels отклонены из-за дополнительных ингредиентов; их файлы в проект не включены.

## Промпты

### Каша

Use case: photorealistic-natural. Create a landscape 3:2 photorealistic food illustration for a family recipe application. ONE shallow matte ivory ceramic bowl of freshly cooked creamy rolled-oat porridge made ONLY with rolled oats, cow milk and mashed banana. Banana is mashed and mixed into the porridge, not a topping. Visible soft oat flakes, pale creamy warm beige texture, natural irregular surface. No toppings at all. Bowl centered and completely visible with generous crop-safe margin on a light warm stone kitchen table, quiet sage linen at one edge. 45 degree overhead camera, soft daylight from left, professional appetizing natural food photography, sharp detailed texture and gentle background falloff. No seeds, chia, nuts, honey, cinnamon, berries, chocolate, butter, herbs, whole fruit, text, logos, hands or people. This is an AI illustration of precisely these three ingredients, not a marketing banner.

### Йогурт

Use case: photorealistic-natural. Create a landscape 3:2 photorealistic food illustration for a family recipe application, companion image to a quiet natural food photograph on light warm stone with soft sage linen. ONE matte ivory ceramic bowl containing ONLY plain white natural yogurt, finely mashed banana and plain rolled oats. Ingredients are mixed together, making a thick off-white yogurt mixture with a few clearly visible pale oat flakes, naturally textured and creamy. All banana mashed and stirred in, no banana slices or other toppings. Cold yogurt bowl, not cooked porridge: recognizable glossy white creamy yogurt texture, unprocessed oat flakes mixed throughout. Bowl centered fully visible with crop-safe margins on the light kitchen table. 45 degree overhead, daylight from left, professionally composed appetizing natural food photography, crisp details, soft background. No granola, chia, nuts, honey, cinnamon, berries, chocolate, peanut butter, seeds, herbs, additional ingredients, fruit beside bowl, hands, people, writing, text or logos. This is an AI illustration of this exact recipe, not a marketing banner.

### Куриная грудка с рисом и овощами

Generate a photorealistic natural editorial food photograph, landscape 3:2. For a calm family recipe application. A single warm off-white ceramic dinner plate on a light beige subtly textured stone table, soft natural window light, sage green linen napkin at right edge, close three-quarter overhead angle. Plate contains exactly THREE SEPARATE components: sliced skinless chicken breast gently cooked in a parchment packet without oil, opaque white inside and lightly golden outside, a mound of plain cooked long-grain white rice, bright green steamed broccoli florets. NO other ingredients: no garnish, no herbs, no parsley, no pepper specks, no sauce, no lemon, no tomato, no carrots, no butter, no oil sheen. Realistic home cooked food, appetizing understated presentation, entire plate visible with narrow breathing space, sharp edible texture, coherent soft shadows. Match a light beige ceramic-and-sage recipe catalog aesthetic. No text, no logos, no people, no collage. This is a new standalone dish illustration.
