import {all, call, spawn} from 'redux-saga/effects'
import toastSaga from "./Toast";
import productSaga from "./Product";

export default function* rootSaga() {

    const sagas = [toastSaga, productSaga];

    yield all(sagas.map(saga =>
        spawn(function* () {
            while (true) {
                try {
                    yield call(saga);
                    break
                } catch (e) {
                    console.log(e)
                }
            }
        }))
    );
}
