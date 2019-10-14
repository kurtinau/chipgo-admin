import {getItemById, getItemsUtil} from "../util";
import {flow, set} from 'lodash/fp';
import {getCategories} from "./Categories";
import {getTreeFromFlatData, walk} from "react-sortable-tree";
import {cloneDeep, isEmpty, isNull} from "lodash";
import {createSelector} from "reselect";
import {hostName} from "../../config/Api";

const getCategoriesState = store => store.catalog.categories;

const getCategoryList = store => getCategoriesState(store) ? getCategoriesState(store).allIds : [];

const getCategoryByIds = store => getCategoriesState(store) ? getCategoriesState(store).byIds : {};

const getProductsState = store => store.catalog.products;

const getProductList = store => getProductsState(store) ? getProductsState(store).allIds : [];

const getProductByIds = store => getProductsState(store) ? getProductsState(store).byIds : {};

// const rootCategory = {id: 0, label: 'Root Category', parentId: -1, isDeleted: -1, disabled: true};


/**selector fro productList page **/
export const getProductsAllIds = (store) => {
    return getProductList(store);
};

const getProductByid = (store, id) => {
    return isEmpty(getProductByIds(store)) ? {} : getProductByIds(store)[id];
};

export const getDescriptionByid = (store, id) => {
    const product = getProductByid(store, id);
    if (!isEmpty(product))
        return isNull(product.description) ? {} : product.description;
    else
        return {};
};


// export const getProduct = (store, id) => {
//     // console.log('getproduct',getProductByid(store, id));
//
//     return getProductByid(store, id);
// };

const prependHostname2ImageUrl = (product) => {
    let file_paths = product.file_path.split(',');
    let thumbnail_paths = product.thumbnail_path.split(',');
    file_paths = file_paths.map(path => hostName.concat(path));
    thumbnail_paths = thumbnail_paths.map(path => hostName.concat(path));
    product.file_path = file_paths.toString();
    product.thumbnail_path = thumbnail_paths.toString();
};

const getProductSelector = createSelector(
    getProductByid,
    (product) => {
        //prepend hostname to image url
        if (isEmpty(product)) {
            return {};
        } else {
            const productWithHostName = cloneDeep(product);
            if (!isEmpty(product.file_path) && !isNull(product.file_path)) {
                //prepend hostname to image url
                prependHostname2ImageUrl(productWithHostName);
                console.log('image file need to add hostName:: ', productWithHostName);
            }
            if (!isEmpty(product.description)) {
                //prepend hostname to description image url
                let descriptionObj = productWithHostName.description;
                Object.values(descriptionObj.entityMap).forEach(value => {
                    if (value.type === 'IMAGE' && !value.data.src.startsWith('http')) {
                        console.log('need to add hostName:: ', value.data.src);
                        value.data.src = hostName.concat(value.data.src);
                    }
                });
                productWithHostName.description = descriptionObj;
            }else{
                productWithHostName.description = {};
            }
            return productWithHostName;
        }
    }
);

export const getProduct = createSelector(
    getProductSelector,
    (product) => {
        return product;
    }
);

// export const getProductWithoutDescription = (store, id) => {
//     const result = getProductByid(store, id);
//     return set('description', {}, result);
// };

export const makeGetProductWithoutDescription = () => createSelector(
    getProductByid,
    (product) => {
        console.log('prras: ', product);
        if (isEmpty(product.file_path)) {
            return product;
        } else {
            const productWithHostName = cloneDeep(product);
            //prepend hostname to image url
            prependHostname2ImageUrl(productWithHostName);
            return set('description', {}, productWithHostName);
        }
    }
);
/*********************************/


/** selector for ProductForm page **/
const transformState2DropdownData = (categories, ids = []) => {
    console.log('transform list to dropdown data');
    let data = [];
    if (isEmpty(ids)) {
        data = getTreeFromFlatData({
            flatData: categories.map(node => ({
                ...node,
                label: node.name,
            })),
            getKey: node => node.id, // resolve a node's key
            getParentKey: node => node.parentId, // resolve a node's parent's key
            rootKey: 0,
        });
    } else {
        let copyedCategories = cloneDeep(categories);
        copyedCategories.forEach(category => {
            ids.forEach(idStr => {
                if (Number(idStr) === category.id) {
                    // console.log('cate-name: ', category.name);
                    category.checked = true;
                }
            });
        });
        data = getTreeFromFlatData({
            flatData: copyedCategories.map(node => ({
                ...node,
                label: node.name,
            })),
            getKey: node => node.id, // resolve a node's key
            getParentKey: node => node.parentId, // resolve a node's parent's key
            rootKey: 0,
        });
    }
    // console.log('return-data: ', data);
    return data;
};

export const makeGetDropdownTreeSelectData = () => createSelector(
    getCategories,
    (categories) => {
        if (categories.length != 0) {
            // console.log('return category');
            console.log('category select tree');
            return transformState2DropdownData(categories);
        }
        return [];
    }
);


// export const getDropdownTreeSelectData = (store) => {
//     const categories = getCategories(store);
//     // const categories = getItemsUtil(getCategoriesState(store));
//     if (categories.length != 0) {
//         // console.log('return category');
//         console.log('category select tree');
//         return transformState2DropdownData(categories);
//     }
//     return [];
// };

// const getProductCategory_id = (store, id) => {
//     console.log('product selector-getProductCategory_id');
//     return isEmpty(getProduct(store, id)) ? [] : getProduct(store, id).category_id.split(',');
// };

const getProductCategory_id = createSelector(
    getProductByid,
    (product) => isEmpty(product) ? '' : product.category_id
    )
;

export const makeGetDropdownTreeSelectDataByCategoryIds = () => createSelector(
    getCategories,
    getProductCategory_id,
    (categories, category_id) => {
        if (!isEmpty(categories)) {
            if (!isEmpty(category_id) && category_id !== '0') {
                const ids = category_id.split(',');
                return transformState2DropdownData(categories, ids);
            } else {
                return transformState2DropdownData(categories);
            }
        }
        return [];
    }
);

export const getDropdownTreeSelectDataByCategoryIds = (store, id) => {
    // const ids = isEmpty(idStr) ? [] : idStr.split(',');
    // const categories = getItemsUtil(getCategoriesState(store));
    const ids = getProductCategory_id(store, id);
    const categories = getCategories(store);
    // console.log('pass-in: ', categories);
    if (!isEmpty(categories)) {
        if (!isEmpty(ids)) {
            // console.log('ids: ', ids);
            // console.log('pass-in: ', categories);
            return transformState2DropdownData(categories, ids);
        } else
            return transformState2DropdownData(categories);
    }
    return [];
};

export const getDescriptionContent = (store) => {
    return getProductsState(store).description;
};

export const getFiles = (store) => {
    return getProductsState(store).files;
};

/*********************************/


