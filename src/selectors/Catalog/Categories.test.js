import {createSelector} from "reselect";
import {getCategories} from "./Categories";

let state = {
    byIds: {
        1: {name: 'test'},
    },
    allIds: [1],
    haea: 0,
};

const reducer = (state) => (
    {
        ...state,
        byIds: {...state.byIds, 1:{name: 'changed'}},
        allIds: [...state.allIds],
        haea: 1,
    }
);

let state1 = {
    byIds: {a: 1},
    allIds: [2],
    haea: 0,
};

const reducer1 = (state,action) => (
    {
        ...state,
        byIds: {...state.byIds},
        allIds: [...state.allIds],
        haea: action(state.haea),
    }
);

const plusOne = x => x + 1;

const getCategoryList = (state) => state.allIds;
const getCategoryByIds = (state) => state.byIds;

// const getCategories = createSelector(
//     [getCategoryList, getCategoryByIds],
//     (allIds, byIds) => allIds.map(id=>byIds[id])
// );

const getCategories1 = createSelector(
    [getCategoryList, getCategoryByIds],
    (allIds, byIds) => allIds[0] + byIds.a
);


test("test get categories selector", () => {
    // expect(getCategories(state, state)).toEqual([{name: 'test'}]);
    // state = reducer(state);
    // expect(getCategories(state, state)).toEqual([{name: 'changed'}]);
    // // expect(getCategories.recomputations()).toEqual(1);
    // state = reducer1(state,plusOne);
    // expect(getCategories.recomputations()).toEqual(2);
    //
    // state = reducer1(state,plusOne);
    // expect(getCategories.recomputations()).toEqual(2);
    //
    // state = reducer1(state,plusOne);
    // expect(getCategories.recomputations()).toEqual(2);
    //
    // state = reducer1(state,plusOne);
    // expect(getCategories.recomputations()).toEqual(2);

    // expect(getCategories1(state1, state1)).toEqual(3);
    // state1 = reducer1(state1);
    // expect(getCategories1.recomputations()).toEqual(1);

});