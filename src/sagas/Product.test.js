import {
    addProductApi, callAPIDeleteFile, handleAddNewDescription,
    handleProductDesImgUpload,
    handleProductImgUpload,
    objURL2file, updateProductApi,
    watchProductAdd, watchProductUpdate
} from "./Product";
import {cloneableGenerator} from '@redux-saga/testing-utils';
import {
    ADD_PRODUCT_FAIL,
    ADD_PRODUCT_REQUEST,
    ADD_PRODUCT_SUCCESS,
    DELETE_DESCRIPTION_FILES_FAIL, DELETE_DESCRIPTION_FILES_SUCCESS,
    UPDATE_PRODUCT_FAIL,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL,
    UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS,
    UPLOAD_PRODUCT_FILES_FAIL,
    UPLOAD_PRODUCT_FILES_SUCCESS
} from "../constants/Products";
import {put} from 'redux-saga';
import {expectSaga} from "redux-saga-test-plan";
import * as matchers from 'redux-saga-test-plan/matchers';
import {throwError} from "redux-saga-test-plan/providers";
import {getDescriptionByid} from "../selectors/Catalog/Products";
import {flow, set} from 'lodash/fp';
import {cloneDeep} from "lodash";

describe('Product saga test', () => {
    URL.revokeObjectURL = jest.fn();
    afterEach(() => {
        URL.revokeObjectURL.mockReset();
    });

    const mockProduct = {
        name: 'test',
        price: 5,
        sku: 'sku-test',
    };
    const payloadWithId = {...mockProduct, id: 1};
    const mockDescription = {
        blocks: [
            {
                data: {},
                depth: 0,
                entityRanges: [],
                inlineStyleRanges: [],
                key: "fq57d",
                text: "asdf",
                type: "unstyled"
            },
            {
                data: {},
                depth: 0,
                entityRanges: [{
                    key: 0,
                    length: 9,
                    offset: 0
                }],
                inlineStyleRanges: [],
                key: "2vugl",
                text: "link-test ",
                type: "unstyled"
            },
            {
                data: {},
                depth: 0,
                entityRanges: [],
                inlineStyleRanges: [],
                key: "770a3",
                text: "",
                type: "unstyled"
            },
            {
                data: {},
                depth: 0,
                entityRanges: [{
                    key: 1,
                    length: 1,
                    offset: 0
                }],
                inlineStyleRanges: [],
                key: "6pudu",
                text: " ",
                type: "atomic"
            },
            {
                data: {},
                depth: 0,
                entityRanges: [],
                inlineStyleRanges: [],
                key: "bd3qf",
                text: "",
                type: "unstyled"
            },
            {
                data: {},
                depth: 0,
                entityRanges: [{
                    key: 2,
                    length: 1,
                    offset: 0
                }],
                inlineStyleRanges: [],
                key: "a9l9q",
                text: " ",
                type: "atomic"
            },
            {
                data: {},
                depth: 0,
                entityRanges: [],
                inlineStyleRanges: [],
                key: "58dgv",
                text: "",
                type: "unstyled"
            },
        ],
        entityMap:
            {
                0: {
                    data: {url: "https://www.google.com.au/maps", targetOption: "_blank"},
                    mutability: "MUTABLE",
                    type: "LINK"
                },
                1: {
                    data: {
                        src: "https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                        height: "auto",
                        width: "auto",
                        alt: "1"
                    },
                    mutability: "MUTABLE",
                    type: "IMAGE"
                },
                2: {
                    data: {
                        src: "blob:http://localhost:3000/2f9450a8-ea16-4c3f-a8d2-f6e43365244d",
                        height: "auto",
                        width: "auto",
                        alt: "2"
                    },
                    mutability: "MUTABLE",
                    type: "IMAGE"
                }
            }
    };
    const mockDescriptionOnlyContainText = {
        blocks: [{
            data: {},
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: [],
            key: "fq57d",
            text: "asdf",
            type: "unstyled"
        },],
        entityMap: {},
    };
    const mockFiles = [
        {
            uuid: 'sdafasdf0',
            lastModified: 156461,
            name: 'file-name1',
            type: 'img/jpg',
            url: "blob:http://localhost:3000/c69f3a9c-532b-4071-8281-0065ad54b51c"
        },
        {
            uuid: 'wefds',
            lastModified: 156461,
            name: 'file-name2',
            type: 'img/png',
            url: "blob:http://localhost:3000/c69f3a9c-532b-4071-8281-assds"
        }
    ];

    describe('handleProductAdd', () => {
        let action = {type: ADD_PRODUCT_REQUEST, payload: {...mockProduct}};
        describe('new product without description and files (test base info only)', () => {
            const mockRes = {response: [{id: 1, name: 'test', price: 5, sku: 'sku-test'}]};
            const mockError = {error: 'Error'};
            it('should add product successful', () => {
                return expectSaga(watchProductAdd)
                    .provide([
                        [matchers.call.fn(addProductApi), mockRes],
                    ])
                    // .put({type: ADD_PRODUCT_SUCCESS, payload: {data: {id: 1, name: 'test'}}})
                    .put.actionType(ADD_PRODUCT_SUCCESS)
                    .dispatch(action)
                    .run();
            });
            it('should add product fail', () => {
                return expectSaga(watchProductAdd)
                    .provide([
                        [matchers.call.fn(addProductApi), mockError]
                    ])
                    .put.actionType(ADD_PRODUCT_FAIL)
                    .dispatch(action)
                    .run();
            });
        });

        describe('new product without description (test files only)', () => {
            const actionWithFiles = set('payload.files', mockFiles, action);
            const mockRes = {response: [{id: 1, name: 'test', price: 5, sku: 'sku-test'}]};
            const mockObjurl2FileRes = {file: 'mockFile'};
            const mockFilesBlobRes = {
                response: [{name: 'image', path: 'test/image'}, {
                    name: 'image2',
                    path: 'test/image2'
                }]
            };
            const mockError = {error: 'Error'};
            it('should upload images successful', () => {
                return expectSaga(watchProductAdd)
                    .provide([
                        [matchers.call.fn(addProductApi), mockRes],
                        [matchers.call.fn(objURL2file), mockObjurl2FileRes],
                        [matchers.call.fn(handleProductImgUpload), mockFilesBlobRes]
                    ])
                    // .put({type: ADD_PRODUCT_SUCCESS, payload: {data: {id: 1, name: 'test'}}})
                    .put.actionType(UPLOAD_PRODUCT_FILES_SUCCESS)
                    .put.actionType(ADD_PRODUCT_SUCCESS)
                    .dispatch(actionWithFiles)
                    .run();
            });
            it('should upload images fail', () => {
                return expectSaga(watchProductAdd)
                    .provide([
                        [matchers.call.fn(addProductApi), mockRes],
                        [matchers.call.fn(objURL2file), mockObjurl2FileRes],
                        [matchers.call.fn(handleProductImgUpload), mockError]
                    ])
                    .put.actionType(UPLOAD_PRODUCT_FILES_FAIL)
                    .put.actionType(ADD_PRODUCT_SUCCESS)
                    .dispatch(actionWithFiles)
                    .run();
            });
        });

        describe('new product without files (test description only)', () => {
            const actionWithDescription = set('payload.description', mockDescription, action);
            const mockRes = {response: [{id: 1, name: 'test', price: 5, sku: 'sku-test'}]};
            const mockUpdateRes = {
                response: [{
                    id: 1, name: 'test', price: 5, sku: 'sku-test', description: {
                        blocks: [],
                        entityMap:
                            {},
                    }
                }]
            };
            const mockDesImgUploadRes = {response: [{name: 'image', path: 'test/image'}]};
            it('should upload description images successful', () => {
                return expectSaga(watchProductAdd)
                    .provide([
                        [matchers.call.fn(addProductApi), mockRes],
                        [matchers.call.fn(handleProductDesImgUpload), mockDesImgUploadRes],
                        [matchers.call.fn(updateProductApi), mockUpdateRes]
                    ])
                    .put.actionType(UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS)
                    .put.actionType(ADD_PRODUCT_SUCCESS)
                    .dispatch(actionWithDescription)
                    .run();
            });
            describe('should upload description images fail', () => {
                it('images upload fail', () => {
                    const mockDesImgUploadError = {error: 'Error'};
                    return expectSaga(watchProductAdd)
                        .provide([
                            [matchers.call.fn(addProductApi), mockRes],
                            [matchers.call.fn(handleProductDesImgUpload), mockDesImgUploadError],
                        ])
                        .put.actionType(UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL)
                        .put.actionType(ADD_PRODUCT_SUCCESS)
                        .dispatch(actionWithDescription)
                        .run();
                });
                describe('images upload success', () => {
                    const mockDesError = {error: 'Error'};
                    const mockDeleteFileRes = {response: [{}]};
                    const mockDeleteFileError = {error: 'Error'};
                    it('but update description fail', () => {
                        return expectSaga(watchProductAdd)
                            .provide([
                                [matchers.call.fn(addProductApi), mockRes],
                                [matchers.call.fn(handleProductDesImgUpload), mockDesImgUploadRes],
                                [matchers.call.fn(updateProductApi), mockDesError],
                                [matchers.call.fn(callAPIDeleteFile), mockDeleteFileRes]
                            ])
                            .put.actionType(UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL)
                            .put.actionType(ADD_PRODUCT_SUCCESS)
                            .dispatch(actionWithDescription)
                            .run();
                    });

                    it('but update description fail and delete files fail', () => {
                        return expectSaga(watchProductAdd)
                            .provide([
                                [matchers.call.fn(addProductApi), mockRes],
                                [matchers.call.fn(handleProductDesImgUpload), mockDesImgUploadRes],
                                [matchers.call.fn(updateProductApi), mockDesError],
                                [matchers.call.fn(callAPIDeleteFile), mockDeleteFileError]
                            ])
                            .put.actionType(DELETE_DESCRIPTION_FILES_FAIL)
                            .put.actionType(UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL)
                            .put.actionType(ADD_PRODUCT_SUCCESS)
                            .dispatch(actionWithDescription)
                            .run();
                    });
                });
            });
        });

        describe('new product with both files and description', () => {
            const actionWithFilesAndDesc = flow(
                set('payload.files', mockFiles),
                set('payload.description', mockDescription),
            )(action);
            const mockRes = {response: [{id: 1, name: 'test', price: 5, sku: 'sku-test'}]};
            const mockImgUploadRes = {response: [{name: 'image1'}]}
            const mockUpdateRes = {
                response: [{
                    id: 1, name: 'test', price: 5, sku: 'sku-test', description: {
                        blocks: [],
                        entityMap: {}
                    }
                }]
            };
            const mockUpdateFail = {error: 'Error'};

            describe('should upload success', () => {

                describe('description only contain text', () => {
                    const actionWithFilesAndDescOnlyTextContent = set('payload.description', mockDescriptionOnlyContainText, actionWithFilesAndDesc);
                    it('should update success', () => {
                        return expectSaga(watchProductAdd)
                            .provide([
                                [matchers.call.fn(addProductApi), mockRes],
                                [matchers.call.fn(handleProductImgUpload), mockImgUploadRes]
                            ])
                            .put.actionType(UPLOAD_PRODUCT_FILES_SUCCESS)
                            .put.actionType(ADD_PRODUCT_SUCCESS)
                            .dispatch(actionWithFilesAndDescOnlyTextContent)
                            .run();
                    });
                });

            });

        });
    });


    describe('handleProductUpdate', () => {
        let action = {type: UPDATE_PRODUCT_REQUEST, payload: {id: 1, name: 'test', price: 5, sku: 'sku-test'}};

        describe('update product base info only', () => {
            const mockSelector = {};
            const mockUpdateRes = {response: {}};
            const mockUpdateError = {error: 'Error'};
            it('update successful', () => {
                return expectSaga(watchProductUpdate)
                    .provide([
                        [matchers.select.selector(getDescriptionByid), mockSelector],
                        [matchers.call.fn(updateProductApi), mockUpdateRes]
                    ])
                    .put.actionType(UPDATE_PRODUCT_SUCCESS)
                    .dispatch(action)
                    .run();
            });
            it('update fail', () => {
                return expectSaga(watchProductUpdate)
                    .provide([
                        [matchers.select.selector(getDescriptionByid), mockSelector],
                        [matchers.call.fn(updateProductApi), mockUpdateError]
                    ])
                    .put.actionType(UPDATE_PRODUCT_FAIL)
                    .dispatch(action)
                    .run();
            });

        });

        describe('update product description', () => {
            const actionWithDescription = set('payload.description', mockDescription, action);
            const mockUpdateRes = {response: [{name: test}]};
            describe('original description is empty', () => {
                const mockSelector = {};
                describe('description only contain text', () => {
                    const actionWithFilesAndDescOnlyTextContent = set('payload.description', mockDescriptionOnlyContainText, actionWithDescription);
                    it('should update successful', () => {
                        return expectSaga(watchProductUpdate)
                            .provide([
                                [matchers.select.selector(getDescriptionByid), mockSelector],
                                [matchers.call.fn(updateProductApi), mockUpdateRes]
                            ])
                            .put.actionType(UPDATE_PRODUCT_SUCCESS)
                            .dispatch(actionWithFilesAndDescOnlyTextContent)
                            .run();
                    });
                });

                describe('description contain images waiting to upload', () => {
                    it('should upload images successful', () => {
                        const mockDesImgUploadRes = {response: 'upload success'};
                        return expectSaga(watchProductUpdate)
                            .provide([
                                [matchers.select.selector(getDescriptionByid), mockSelector],
                                [matchers.call.fn(handleProductDesImgUpload), mockDesImgUploadRes],
                                [matchers.call.fn(updateProductApi), mockUpdateRes]
                            ])
                            .put.actionType(UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS)
                            .put.actionType(UPDATE_PRODUCT_SUCCESS)
                            .dispatch(actionWithDescription)
                            .run();
                    });
                    it('should upload images fail', () => {
                        const mockDesImgUploadError = {error: 'Error'};
                        return expectSaga(watchProductUpdate)
                            .provide([
                                [matchers.select.selector(getDescriptionByid), mockSelector],
                                [matchers.call.fn(handleProductDesImgUpload), mockDesImgUploadError]
                            ])
                            .put.actionType(UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL)
                            .put.actionType(UPDATE_PRODUCT_FAIL)
                            .dispatch(actionWithDescription)
                            .run();
                    })
                });
            });

            describe('original description is not empty', () => {
                const mockDesImgUploadRes = {response: 'upload success'};
                const mockOriginalDescription = set('entityMap[2]', {
                    data: {
                        src: "http://localhost:3001/upload/images/file-name",
                        height: "auto",
                        width: "auto",
                        alt: "2"
                    },
                    mutability: "MUTABLE",
                    type: "IMAGE"
                }, mockDescription);
                describe('add new images', () => {
                    let mockSelector = cloneDeep(mockOriginalDescription);
                    const action = cloneDeep(actionWithDescription);
                    delete mockSelector.entityMap[2];
                    it('should upload successful', () => {
                        return expectSaga(watchProductUpdate)
                            .provide([
                                [matchers.select.selector(getDescriptionByid), mockSelector],
                                [matchers.call.fn(handleProductDesImgUpload), mockDesImgUploadRes],
                                [matchers.call.fn(updateProductApi), mockUpdateRes]
                            ])
                            .put.actionType(UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS)
                            .put.actionType(UPDATE_PRODUCT_SUCCESS)
                            .dispatch(action)
                            .run();
                    });
                });

                describe('change image to a new image', () => {
                    let mockSelector = cloneDeep(mockOriginalDescription);
                    const newImageEntity = {
                        data: {
                            src: "blob:http://localhost:3000/new-image-uuid",
                            height: "auto",
                            width: "auto",
                            alt: "2"
                        },
                        mutability: "MUTABLE",
                        type: "IMAGE"
                    };
                    const action = set('payload.description.entityMap[2]', newImageEntity, actionWithDescription);
                    const mockDeleteDesImgRes = {response: 'delete successful'};
                    it('should upload successful', () => {
                        return expectSaga(watchProductUpdate)
                            .provide([
                                [matchers.select.selector(getDescriptionByid), mockSelector],
                                [matchers.call.fn(handleProductDesImgUpload), mockDesImgUploadRes],
                                [matchers.call.fn(callAPIDeleteFile), mockDeleteDesImgRes],
                                [matchers.call.fn(updateProductApi), mockUpdateRes]
                            ])
                            .put.actionType(UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS)
                            .put.actionType(DELETE_DESCRIPTION_FILES_SUCCESS)
                            .put.actionType(UPDATE_PRODUCT_SUCCESS)
                            .dispatch(action)
                            .run();
                    });
                });

            });
        });
    });

});
