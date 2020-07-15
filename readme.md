## Демо
[Github Pages](https://pizekatto.github.io/neon/)
## Запуск
```bash
npm start
```
## Компоненты
### Sticky Navbar
Navbar переходит в состояние `Sticky` используя `Intersection Observer`. Логотип меняется на телефонном разрешении через `mediaQueryList`. Секции отслеживаются и подсвечиваются. Переходы по якорям с эффектом `SmoothScroll`.
### Анимация
Анимация применяется через `data`-атрибут с нужным классом, срабатывает используя `Intersection Observer`
### Couner
Счетчик сделан на асинхронном генераторе
### Ресурсы
Для плавной прокрутки `scrollIntoView()` Использован [SmothScroll polyfill](https://github.com/alicelieutier/smoothScroll)