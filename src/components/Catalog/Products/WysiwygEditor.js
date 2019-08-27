import React, {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux'
import {EditorState, convertFromRaw, convertToRaw, RichUtils} from 'draft-js';
import {Editor} from "react-draft-wysiwyg";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {isEmpty} from "lodash";
import {setDescription} from "../../../actions/Catalog/Products";


const WysiwygEditor = (props) => {
    const dispatch = useDispatch();
    const [uploadedImages, setUploadedImages] = useState([]);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    useEffect(() => {
        const {description} = props;
        console.log('descri:::::: ', description);
        if (!isEmpty(description)) {
            let newDescription = {
                raw: description,
                files: [],
                remoteFiles: [],
            };
            Object.keys(description.entityMap).forEach(key => {
                newDescription.remoteFiles.push(description.entityMap[key].data.src);
            });
            // dispatch(setDescription(newDescription));
            // this.props.setDescription(newDescription);
            setEditorState(EditorState.createWithContent(convertFromRaw(description)));
            // this.setState({
            //     editorState: EditorState.createWithContent(convertFromRaw(descriptionObj)),
            // });
        }
    }, [props.description]);


    const onEditorStateChange = (editorState) => {
        const content = editorState.getCurrentContent();
        const raw = convertToRaw(content);
        let description = {
            raw: raw,
            files: {},
            remoteFiles: {},
        };
        const entityValues = Object.values(raw.entityMap);
        if (!isEmpty(entityValues)) {
            entityValues.forEach((value, index) => {
                const fileSrc = value.data.src;
                if (!isEmpty(uploadedImages)) {
                    if (fileSrc.startsWith('blob:')) {
                        //file from local and waiting to upload
                        description.files[index] = uploadedImages.filter(obj => obj.localSrc === fileSrc)[0].file;
                    } else {
                        //file from remote server
                        description.remoteFiles[index] = fileSrc;
                    }
                } else {
                    //file from remote server
                    description.remoteFiles[index] = fileSrc;
                }
            });
        }

        console.log('dess: ', description);
        dispatch(setDescription(description));
        // props.setDescription(description);
        setEditorState(editorState);
    };

    const uploadImageCallBack = (file) => {
        // long story short, every time we upload an image, we
        // need to save it to the state so we can get it's data
        // later when we decide what to do with it.

        // Make sure you have a uploadImages: [] as your default state
        // const p = this.uploadImage(file);
        // console.log('ppp:  ',p);
        let newUploadedImages = [...uploadedImages];

        const imageObject = {
            file: file,
            localSrc: URL.createObjectURL(file),
        };
        newUploadedImages.push(imageObject);
        setUploadedImages(newUploadedImages);
        // this.setState({uploadedImages: uploadedImages});


        // We need to return a promise with the image src
        // the img src we will use here will be what's needed
        // to preview it in the browser. This will be different than what
        // we will see in the index.md file we generate.
        return new Promise(
            (resolve, reject) => {
                resolve({data: {link: imageObject.localSrc}});
            }
        );
    };

    return (
        <Editor
            editorState={editorState}
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            onEditorStateChange={onEditorStateChange}
            toolbar={{
                inline: {inDropdown: true},
                list: {inDropdown: true},
                textAlign: {inDropdown: true},
                link: {inDropdown: true},
                history: {inDropdown: false},
                image: {
                    uploadCallback: uploadImageCallBack,
                    alt: {present: true, mandatory: true},
                    previewImage: true,
                },
            }}
            handleKeyCommand={(command) => {

                let newState = RichUtils.handleKeyCommand(editorState, command);

                if (newState) {
                    onEditorStateChange(newState);
                    return "handled"
                }

                return "not-handled"
            }}
        />
    );
};

export default WysiwygEditor;
