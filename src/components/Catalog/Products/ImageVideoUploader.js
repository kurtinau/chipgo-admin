import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import DropzoneComponent from 'react-dropzone-component';
import 'react-dropzone-component/styles/filepicker.css';
import 'dropzone/dist/min/dropzone.min.css';
import Button from "reactstrap/es/Button";
import ButtonGroup from "reactstrap/es/ButtonGroup";
import {Row} from "reactstrap";
import Col from "reactstrap/es/Col";
import API, {hostName, imageURL} from "../../../config/Api";
import {deleteProductFiles, appendFile, removeFile} from "../../../actions/Catalog/Products";
import {isEmpty} from "lodash";
import {showModal} from "../../../actions/Notification";
import {getIndicatorSelector} from "../../../selectors/Api";
import {DELETE_PRODUCTS_FILES_SUCCESS} from "../../../constants/Products";

let myDropzone;

const ImageVideoUploader = (props) => {


    const addRemoveBtn = (btnText, clickFun) => {
        const detailsEls = document.querySelectorAll(".dz-details");
        let detailsEl = detailsEls[detailsEls.length - 1];
        const removeBtn = document.createElement("a",);
        removeBtn.setAttribute("class", "dz-remove");
        const att = document.createAttribute("data-dz-remove");
        removeBtn.setAttributeNode(att);
        const t = document.createTextNode(btnText);
        removeBtn.appendChild(t);
        removeBtn.addEventListener("click", clickFun);
        detailsEl.appendChild(removeBtn);
    };

    const editRemoveBtn = (btnText, clickFun) => {
        const removeBtns = document.querySelectorAll(".dz-remove");
        removeBtns.forEach(btn => {
            if (btn.innerHTML === 'Remove File') {
                btn.innerHTML = btnText;
                btn.addEventListener('click', clickFun);
            }
        });
    };

    const editRemoveBtnAfterUpload = (serverFile, localFile) => {
        const btnText = 'Delete File';
        const clickFun = () => {
            dispatch(showModal({
                title: 'Delete File',
                content: 'Are you sure delete file from server?',
                type: 'confirm',
                onConfirm: () => {
                    dispatch(deleteProductFiles(serverFile.name, serverFile.id, () => myDropzone.removeFile(localFile)));
                }
            }));
        };
        editRemoveBtn(btnText, clickFun);
    };

    useEffect(() => {
        const {file_path, thumbnail_path, product_id} = props;
        if (!isEmpty(file_path)) {
            const filesURL = file_path.split(',');
            const thumbnailURL = thumbnail_path.split(',');
            thumbnailURL.forEach((url, index) => {
                const name = url.substr(url.lastIndexOf('/') + 1);
                let mockFile = {
                    name: name,
                    accepted: true,
                    status: 'complete',
                    path: filesURL[index].slice(hostName.length),
                    thumbnail: url.slice(hostName.length),
                    id: product_id,
                };
                myDropzone.files.push(mockFile);
                myDropzone.emit("addedfile", mockFile);
                myDropzone.emit("thumbnail", mockFile, url);
                myDropzone.emit("complete", mockFile);
            });
            const existingFileCount = filesURL.length; // The number of files already uploaded
            myDropzone.options.maxFiles = myDropzone.options.maxFiles - existingFileCount;
        }
    }, [props.file_path]);

    const dispatch = useDispatch();
    const componentConfig = {postUrl: imageURL + '/' + props.product_id};
    const djsConfig = {
        autoProcessQueue: false,
        // addRemoveLinks: true,
        acceptedFiles: "image/*,video/*",
        parallelUploads: 10,
        uploadMultiple: true,
        maxFiles: 10,
        paramName: function () {
            return 'files';
        },
    };

    const eventHandlers = {
        init: (dropzone) => {
            myDropzone = dropzone;
        },
        addedfile: (file) => {
            let clickFun;
            let btnText = '';
            if (file.status === 'complete') {
                //delete file from server
                btnText = 'Delete File';
                clickFun = () => {
                    dispatch(showModal({
                        title: 'Delete File',
                        content: 'Are you sure delete file from server?',
                        type: 'confirm',
                        onConfirm: () => {
                            dispatch(deleteProductFiles(file.name, file.id, () => myDropzone.removeFile(file)));
                        }
                    }));
                };
            } else {
                console.log('file: ', file);
                if (props.product_id <= 0) {
                    //when in the add product page, all files are waiting to upload, so need to pass up to parent
                    props.onChange(myDropzone.files);
                } else {
                    //when in the edit product page, only pass files with status "queued" or 'added' to parent
                    let waiting2uploadFiles = myDropzone.getQueuedFiles();
                    waiting2uploadFiles.push(file);
                    props.onChange(waiting2uploadFiles.length);
                }
                //remove file that is not uploaded to server
                btnText = 'Remove File';
                clickFun = () => {
                    console.log('props: ', props);
                    dispatch(showModal({
                        title: 'Remove File',
                        content: 'Are you sure remove file?',
                        type: 'confirm',
                        onConfirm: () => {
                            myDropzone.removeFile(file);
                        }
                    }));
                };
            }
            addRemoveBtn(btnText, clickFun);
        },
        successmultiple: (files, response) => {
            console.log('asdf:: ', files);
            const responseFiles = JSON.parse(response).response;
            console.log('ressss: ', responseFiles);
            // dispatch(setFiles(responseFiles));
            responseFiles.forEach((resFile, index) => {
                // props.waiting2UploadDecrement();
                editRemoveBtnAfterUpload(resFile, files[index]);
            });
            //after upload files, need to set waiting2uploadfiles empty
            props.onChange(0);
        },
        removedfile: (file) => {
            // if (file.status === 'complete') {
            //     console.log('hello: ', file.id);
            //     dispatch(deleteProductFiles(file.name, file.id));
            //     console.log('delete server file: ', file);
            // }
            if (file.status !== 'complete') {
                if (props.product_id <= 0) {
                    props.onChange(myDropzone.files);
                } else {
                    //don't need pass all file object to parent, just a length of queuedFiles array would work
                    props.onChange(myDropzone.getQueuedFiles().length)
                }
            }
        }
    };

    const removeAllFiles = () => {
        if (myDropzone) {
            dispatch(showModal({
                title: 'Remove Files',
                content: 'Are you sure remove all files?',
                type: 'confirm',
                onConfirm: () => {
                    const files = myDropzone.files;
                    files.forEach(file => {
                        if (file.status !== 'success' && file.status !== 'complete') {
                            myDropzone.removeFile(file);
                        }
                    });
                }
            }));
        }
    };
    const uploadAllFiles = () => {
        myDropzone.processQueue();
    };

    return (
        <div>
            <Row>
                <Col>
                    <DropzoneComponent config={componentConfig}
                                       eventHandlers={eventHandlers}
                                       djsConfig={djsConfig}/>
                </Col>
            </Row>
            <Row className="pt-3">
                <Col>
                    <ButtonGroup>
                        <Button color="secondary" onClick={removeAllFiles}>Clear</Button>

                        {
                            //when product_id is less than 0, then this component would be in adding product page
                            props.product_id <= 0 ?
                                null
                                :
                                <Button color="primary" onClick={uploadAllFiles}>Upload</Button>
                        }
                    </ButtonGroup>
                </Col>
            </Row>
        </div>
    );
};

export default ImageVideoUploader;
