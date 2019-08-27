import {getItemById, getItemsUtil} from "../util";
import {flow, set} from 'lodash/fp';
import {getCategories} from "./Categories";
import {getTreeFromFlatData} from "react-sortable-tree";
import {cloneDeep, isEmpty} from "lodash";
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
            console.log('prr: ', product);
            if(!isEmpty(product.file_path)){
                //prepend hostname to image url
                prependHostname2ImageUrl(productWithHostName);
            }
            //prepend hostname to description image url
            let descriptionObj = JSON.parse(productWithHostName.description);
            Object.values(descriptionObj.entityMap).forEach(value => value.data.src = hostName.concat(value.data.src));
            productWithHostName.description = descriptionObj;
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
        if(isEmpty(product.file_path)){
            return product;
        }else{
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

export const getDropdownTreeSelectData = (store) => {
    const categories = getCategories(store);
    // const categories = getItemsUtil(getCategoriesState(store));
    if (categories.length != 0) {
        // console.log('return category');
        return transformState2DropdownData(categories);
    }
    return [];
};

export const getDropdownTreeSelectDataByCategoryIds = (store, id) => {
    // const ids = isEmpty(idStr) ? [] : idStr.split(',');
    // const categories = getItemsUtil(getCategoriesState(store));
    const ids = isEmpty(getProduct(store, id)) ? [] : getProduct(store, id).category_id.split(',');
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


