# polygon-constructor

## Usage

Сначала создайте новый полигон

```js
const polygon = new Polygon()
// ... Можете добавлять блоки
// ... Экспортировать, импортировать
```

## Рабочая область (PolygonArea)

### setOpenWalls

"Открывает" одну или несколько стен. Подаётся агрумент `...sides`. Используемые значения: `"left" | "right" | "top" | "bottom"`. Подавать значения можно в любом порядке.

```js
PolygonArea.setOpenWalls("left", "top")
```

### size

Возвращяет размер рабочей области `Vector2` в пикселях. Может использоваться для изменения размера.

```js
PolygonArea.size = new Vector2(1000, 500) // width: 1000px, height: 500px
```

### ratio

Возвращяет текущие соотношение пикселей и сантиметров (px:cm). Может использоваться для изменения соотношения. Соотношение поумолчанию 1 пиксель к одному сантиметру (1:1).

```js
PolygonArea.ratio = 1 / 2 // px:cm
```

### clear

Очищяет рабочую область.

```js
PolygonArea.clear()
```

## Блоки (PolygonBlocks)

### add

Добавляет `block`. Имеет side-effects. Можно отслеживать добавление с помощью `PolygonBlocks.on("add", block => {})`

```js
PolygonBlocks.add(#PolygonBlock) // Интрефейсы можно найти ниже
```

### remove

Удаляет `block`. Имеет side-effects. Можно отслеживать добавление с помощью `PolygonBlocks.on("remove", block => {})`

```js
PolygonBlocks.remove(#PolygonBlock) // Интрефейсы можно найти ниже
```

### removeById

Удаляет `block` по `id`. Имеет side-effects. Можно отслеживать добавление с помощью `PolygonBlocks.on("remove", block => {})`. Удаляет также из `PolygonPicker` и если значение `maxAmount` = 0, то удаляет **все** блоки из `PolygonArea`.

```js
PolygonBlocks.removeById(7)
```

## Общие методы (Polygon)

### export

Экспортирует используемые в `PolygonArea` блоки. Возвращяет `PolygonBlockOutput`.

```js
Polygon.export()
```

### import

Импортирует в `PolygonArea` блоки. Принимает `...blocks` в формате `PolygonBlockOutput`.

Если на `PolygonArea` всё ещё есть блоки или блока нету в `PolygonPicker`, выбрасывает ошибку.

```js
Polygon.import(...PolygonBlockOutput[]) // Интрефейсы можно найти ниже
```

## Интрефейсы

```ts
interface PolygonBlock {
	id: number

	name: string
	image: string
	amount: number

	width: number // cm
	height: number // cm

	angle: number // deg
}
```

```ts
interface PolygonBlockOutput {
	id: number

	x: number // cm
	y: number // cm

	angle: number // deg
}
```
