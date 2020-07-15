## Демо
[Github Pages](https://pizekatto.github.io/crypto/)
## Запуск
```bash
npm start
```
## Описание
Приложение представляет собой портфель криптовалют. Создано на чистом JavaScritpt с применением [Redux](https://github.com/reduxjs/redux) для хранения состояния. Данные по криптовалютам берутся из API [CryptoCompare](https://min-api.cryptocompare.com/), обновляется по WebSocket. Курсы фиатных валют загружаются из сервиса [курсы валют в формате JSON](https://www.cbr-xml-daily.ru/), который формирует JSON из данных Центробанка РФ.
- состояние приложения при каждом обновлении сохраняется в localStorageы
- курсы ЦБ кешируются в до следующего обновления со стороны ЦБ
### Анимация
Анимация применяется через `data`-атрибут с нужным классом, срабатывает используя `Intersection Observer`
### Ресурсы
- [Redux](https://github.com/reduxjs/redux) - управление состоянием приложения
- [CryptoCompare.com](https://min-api.cryptocompare.com/) - данные по криптовалютам
- [SmothScroll polyfill](https://github.com/alicelieutier/smoothScroll) для плавной прокрутки `scrollIntoView()`