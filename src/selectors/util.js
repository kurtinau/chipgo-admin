export const getItemById = (getItemState, id) => getItemState ? getItemState.byIds[id] : {};

const getItemList = getItemState => getItemState ? getItemState.allIds : [];

export const getItemsUtil = getItemState => getItemList(getItemState).map(id => getItemById(getItemState, id));
