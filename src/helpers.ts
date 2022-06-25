function composePolygonObject(block: PolygonBlock): PolygonObject {
  if (block.id == null) block.id = -1

  const element = document.createElement("div")
  element.appendChild(composeImageElement(block.image))
  element.classList.add(DEFAULT_CLASS_NAME)


  return new PolygonObject(element, block)
}

function composeImageElement(src: string) {
  const element = document.createElement("img")
  element.src = src

  return element
}


function composePickerBlockElement() {
  const pickerElement = document.createElement("div")
  pickerElement.className = PICKET_BLOCK_CLASS

  return pickerElement
}

function composePickerBlockAmountElement(amount: number) {
  const element = document.createElement("div")
  element.className = PICKET_BLOCK_CLASS + "__amount"
  element.textContent = "x" + String(amount)

  return element
}

function composePickerBlockTitleElement(title: string) {
  const element = document.createElement("div")
  element.className = PICKET_BLOCK_CLASS + "__title"
  element.textContent = title

  return element
}