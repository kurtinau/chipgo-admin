import React from 'react'
import {TextPrompt, PasswordPrompt} from './Prompts'
import * as ReactBootstrap from 'reactstrap';
import PromptInput from './PromptInput'
import {Button} from "reactstrap";

const Modal = ReactBootstrap.Modal;
const ModalBody = ReactBootstrap.ModalBody;
const ModalFooter = ReactBootstrap.ModalFooter;
const ModalHeader = ReactBootstrap.ModalHeader;



/**
 * The modal dialog which can be altenative to `window.confirm` and `window.alert`.
 * @example <Dialog ref={(el) => {this.dialog = el} />
 * @example this.dialog.show({body: 'Hello!', actions: [Dialog.Action('do', () => console.log('ok'))]})
 * @example this.dialog.showAlert('Hello!')
 */
class Dialog extends React.Component {
    /**
     * Set default options for applying to all dialogs.
     * @param options
     */
    static setOptions(options) {
        Dialog.options = Object.assign({}, Dialog.DEFAULT_OPTIONS, options)
    }

    /**
     * Reset default options to presets.
     */
    static resetOptions() {
        Dialog.options = Dialog.DEFAULT_OPTIONS
    }

    static initialState() {
        return {
            title: null,
            body: null,
            showModal: false,
            actions: [],
            bsSize: undefined,
            onHide: null,
            prompt: null
        }
    }

    constructor(props) {
        super(props)
        this.promptInput = null
        this.keyBinds = []
        this.state = Dialog.initialState()
        this.onHide = this.onHide.bind(this)
        this.onSubmitPrompt = this.onSubmitPrompt.bind(this)
    }

    componentWillUnmount() {
        if (this.state.showModal) {
            this.hide()
        }
    }

    /**
     * Show dialog with choices. This is similar to `window.confirm`.
     * @param options Object for dialog options.
     * @param options.title The title of dialog.
     * @param options.body The body of message.
     * @param options.actions {DialogAction} The choices for presenting to user.
     * @param options.bsSize {[null, 'medium', 'large', 'small']} The width size for dialog.
     * @param options.onHide {function} The method to call when the dialog was closed by clicking background.
     * @param options.prompt {[null, Prompt]} Use prompt for text input or password input.
     */
    show(options = {}) {
        let keyBinds = {}
        let actions = options.actions || []
        actions.forEach((action) => {
            if (action.key) {
                action.key.split(',').forEach((key) => {
                    keyBinds[key] = () => {
                        action.func && action.func(this)
                    }
                })
            }
        })
        // TODO: Add keybinds
        this.keyBinds = keyBinds
        options['showModal'] = true
        this.setState(Dialog.initialState())
        this.setState(options)
    }

    /**
     * Show message dialog This is similar to `window.alert`.
     * @param body The body of message.
     * @param bsSize {[null, 'medium', 'large', 'small']} The width size for dialog.
     */
    showAlert(body, bsSize = undefined) {
        const options = {
            body: body,
            actions: [
                Dialog.SingleOKAction()
            ],
            bsSize: bsSize
        }
        this.show(options)
    }

    onHide() {
        const onHide = this.state.onHide
        if (typeof onHide === 'function') {
            onHide(this)
        } else {
            this.hide()
        }
    }

    /**
     * Hide this dialog.
     */
    hide() {
        if (!this.state.showModal) return
        // TODO: Remove keybinds
        this.setState({showModal: false})
    }

    /**
     * Get the value in prompt.
     * @return {string, null}
     */
    get value() {
        if (this.promptInput) {
            return this.promptInput.value
        }
        return null
    }

    onSubmitPrompt() {
        const action = this.keyBinds['enter']
        action && action()
    }

    getSize(defaultSize) {
        return (typeof this.state.bsSize) === 'undefined' ? defaultSize : (this.state.bsSize === 'medium' ? null : this.state.bsSize)
    }

    createBodyText(){
        return {__html: this.state.body};
    }

    render() {
        // XXX: Check current ReactBootstrap v4, or not.
        const isLaterV4 = !!ReactBootstrap['Card']

        const additionalProps = (
            isLaterV4 ? {
                size: this.getSize('sm')
            } : {
                bsSize: this.getSize('small')
            }
        )
        return (
            <Modal isOpen={this.state.showModal} toggle={this.onHide} >
                {
                    this.state.title && (
                        <ModalHeader>
                            {this.state.title}
                        </ModalHeader>
                    )
                }
                <ModalBody>
                    {
                        typeof this.state.body === 'string'
                            ? (<div dangerouslySetInnerHTML={this.createBodyText()} />)
                            : this.state.body
                    }
                    {
                        this.state.prompt && (
                            <PromptInput
                                ref={(el) => {
                                    this.promptInput = el
                                }}
                                prompt={this.state.prompt}
                                onSubmit={this.onSubmitPrompt}
                            />
                        )
                    }
                </ModalBody>
                <ModalFooter>
                    {
                        this.state.actions.map((action, index) => {
                            return (
                                <Button
                                    key={index}
                                    // type='button'
                                    // className={`btn btn-sm ${action.className}`}
                                    color={action.className}
                                    onClick={() => {
                                        action.func && action.func(this)
                                    }}>
                                    {action.label}
                                </Button>
                            )
                        })
                    }
                </ModalFooter>
            </Modal>
        )
    }
}

/**
 * The class to construct a choice for Dialog.
 * Use `Dialog.Action(options)`.
 */
class DialogAction {
    /**
     * Constructor
     * @param label The text or node for button. Default is `OK`.
     * @param func The function to execute when button is clicked. Default is null.
     * @param className The class name for button. Default is ''.
     */
    constructor(label, func, className, key) {
        this.label = label || Dialog.options.defaultOkLabel
        this._func = func
        this.className = className || Dialog.options.defaultButtonClassName
        this.key = key
    }

    func(dialog) {
        dialog.hide()
        this._func && this._func(dialog)
    }
}

Dialog.DEFAULT_OPTIONS = {
    defaultOkLabel: 'OK',
    defaultCancelLabel: 'Cancel',
    primaryClassName: 'primary',
    defaultButtonClassName: 'secondary'
}

Dialog.options = Dialog.DEFAULT_OPTIONS

Dialog.Action = (label, func, className, key) => new DialogAction(label, func, className, key)
Dialog.DefaultAction = (label, func, className) => new DialogAction(label, func, className && className.length > 0 ? className : Dialog.options.primaryClassName, 'enter')
Dialog.OKAction = (func) => new DialogAction(Dialog.options.defaultOkLabel, (dialog) => {
    dialog.hide();
    func && func(dialog)
}, Dialog.options.primaryClassName, 'enter')
Dialog.CancelAction = (func) => new DialogAction(Dialog.options.defaultCancelLabel, (dialog) => {
    dialog.hide();
    func && func(dialog)
}, null, 'esc')
Dialog.SingleOKAction = () => new DialogAction(Dialog.options.defaultOkLabel, (dialog) => {
    dialog.hide()
}, Dialog.options.primaryClassName, 'enter,esc')

Dialog.TextPrompt = (options) => new TextPrompt(options)
Dialog.PasswordPrompt = (options) => new PasswordPrompt(options)

Dialog.displayName = 'Dialog'
// module.exports = Dialog

export default Dialog;