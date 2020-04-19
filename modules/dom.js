var exports = (module.exports = {});

exports.getElementById = (element, id) => {
  if (!element) return null;
  if (element.attributes) {
    let idAttr = element.attributes.find((attr) => attr.key == "id");
    if (idAttr && idAttr.value && idAttr.value == id) return element;
  }
  if (!element.children) return null;
  for (let child of element.children) {
    let el = getElementById(child, id);
    if (el) return el;
  }
  return null;
};

exports.getElementByTag = (element, tag) => {
  if (!element) return null;
  let elementsWithTag = [];
  if (element.tagName && element.tagName == tag) {
    elementsWithTag.push(element);
  }
  if (!element.children) return elementsWithTag;
  for (let child of element.children) {
    let els = getElementByTag(child, tag);
    elementsWithTag.push(...els); // we don't want nested arrays
  }
  return elementsWithTag;
};

exports.getElementByType = (element, type) => {
  if (!element) return null;
  let elementsWithType = [];
  if (element.type && element.type == type) {
    elementsWithType.push(element);
  }
  if (!element.children) return elementsWithType;
  for (let child of element.children) {
    let els = getElementByType(child, type);
    elementsWithType.push(...els); // we don't want nested arrays
  }
  return elementsWithType;
};
