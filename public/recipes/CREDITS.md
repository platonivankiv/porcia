# Изображения рецептов Porcia

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
