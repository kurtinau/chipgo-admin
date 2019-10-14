import React, {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux'
import {EditorState, convertFromRaw, convertToRaw, RichUtils} from 'draft-js';
import {Editor} from "react-draft-wysiwyg";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {isEmpty} from "lodash";
import {setDescription} from "../../../actions/Catalog/Products";


const WysiwygEditor = (props) => {
    const [uploadedImages, setUploadedImages] = useState([]);

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
        console.log('type: ', file.type);
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

    const onChange = (editorState) => {
        console.log('des changed: ', convertToRaw(editorState.getCurrentContent()));
        props.onChange('description', editorState);
    };

    return (
        <Editor
            editorState={props.description}
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            onEditorStateChange={onChange}
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

                let newState = RichUtils.handleKeyCommand(props.description, command);

                if (newState) {
                    onChange(newState);
                    return "handled"
                }

                return "not-handled"
            }}
        />
    );
};

export default WysiwygEditor;
