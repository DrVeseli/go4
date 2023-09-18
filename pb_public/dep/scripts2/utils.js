// utils.js

export function fetchCollectionItems(collectionName, params = {}) {
    return pb.collection(collectionName).getList(1, 30, params);  // Default values adjusted
}

export function createElementWithAttributes(tag, attributes) {
    const element = document.createElement(tag);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}
