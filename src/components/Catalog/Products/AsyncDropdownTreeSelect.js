import React, {Component} from 'react';
import DropdownTreeSelect from "react-dropdown-tree-select";
import isEqual from 'lodash/isEqual'
import {getTreeFromFlatData} from "react-sortable-tree";


class AsyncDropdownTreeSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (!isEqual(nextProps.data, this.state.data)) {
            this.setState({data: nextProps.data})
        }
    };

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (!isEqual(prevProps.data, this.state.data)) {
    //         this.setState({data: prevProps.data})
    //     }
    // }

    shouldComponentUpdate = (nextProps) => {
        const flag = !isEqual(nextProps.data, this.state.data);
        return flag;
    };

    // componentDidMount() {
    //
    //     this.props.initialDropdown();
    //     this.setState({
    //         data: this.props.dropdownCategories,
    //     });
    //
    //     // const {categories, selected_categories}  = this.props;
    //     //
    //     // const data = getTreeFromFlatData({
    //     //     flatData: categories.map(node => ({
    //     //         ...node,
    //     //         label: node.name,
    //     //     })),
    //     //     getKey: node => node.id, // resolve a node's key
    //     //     getParentKey: node => node.parentId, // resolve a node's parent's key
    //     //     rootKey: 0,
    //     // });
    // }

    render() {
        const {data, ...rest} = this.props;
        return (
            <DropdownTreeSelect data={this.state.data} className="categories-dropdown"
                                {...rest}
            />
        );
    };
}


export default AsyncDropdownTreeSelect;