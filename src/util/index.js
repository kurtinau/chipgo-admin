export const isEmpty = obj => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
};


export const arrayIsEmpty = arr => arr.length === 0;

export const compareObject = (obj1, obj2) => {
    //Loop through properties in object 1
    for (let p in obj1) {
        //Check property exists on both objects
        if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

        switch (typeof (obj1[p])) {
            //Deep compare objects
            case 'object':
                if (!Object.compare(obj1[p], obj2[p])) return false;
                break;
            //Compare function code
            case 'function':
                if (typeof (obj2[p]) === 'undefined' || (p !== 'compare' && obj1[p].toString() !== obj2[p].toString())) return false;
                break;
            //Compare values
            default:
                if (obj1[p] !== obj2[p]) return false;
        }
    }

    //Check object 2 for any extra properties
    for (let p in obj2) {
        if (typeof (obj1[p]) === 'undefined') return false;
    }
    return true;
};

export const compareObjectWithGivenKey = (obj1, obj2, keys) => {
    let result = true;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (obj1.hasOwnProperty(key) !== obj2.hasOwnProperty(key)) return false;
        if (obj1[key] !== obj2[key]) {
            result = false;
            break;
        }
    }
    return result;
};

export const findIdByFields = (arr, obj) => {
    //find id by compare rest of fields
    let result = 0;
    const keys = Object.keys(obj);
    for (let i = 0; i < arr.length; i++) {
        let flag = true;
        for (let j = 0; j < keys.length; j++) {
            const key = keys[j];
            if (arr[i][key] !== obj[key]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            result = arr[i].id;
            break;
        }
    }
    return result;
};

/**
 * convert from blob obj to File obj
 * @param obj = {name, url, lastModified, type}
 */
export const blob2file = (obj) => {
    if (isEmpty(obj)) {
        return {};
    }
    return new File(obj.url, obj.name, {lastModified: obj.lastModified, type: obj.type});
};