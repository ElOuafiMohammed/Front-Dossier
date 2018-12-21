/**
  * Improve the Angular perf
  * @param index list index
  * @param item list item
  */
export function sigaTrackById(index, item) {
  // If id is defined
  if (item.id) {
    return item.id;

    // If numero is defined
  } else if (item.numero) {
    return item.numero
  }
  return index;
}