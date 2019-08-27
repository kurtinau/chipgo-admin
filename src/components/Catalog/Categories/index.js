import React, {Component} from 'react';
import Loadable from 'react-loadable';
import {Card, CardBody, CardHeader, Col, Row} from "reactstrap";
import Loading from "../../Loading";
import Button from "reactstrap/es/Button";
import {showModal} from "../../../actions/Notification";

const TreeView = Loadable({
    loader: () => import('../../../containers/Categories/TreeView'),
    loading: Loading,
});

const RevisionHistory = Loadable({
    loader: () => import('../../../containers/Categories/RevisionHistory'),
    loading: Loading,
});


export default class Categories extends Component {

    componentDidMount() {
        this.props.fetchCategories();
    }

    render() {
        const {isLoading} = this.props;
        // const renderModal = isEmpty(modal) ? null : (<InfoModal modal={modal}/>);
        const renderValue = isLoading ? <Loading/> : (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" lg="6">
                        <Card>
                            <CardHeader>
                                Categories
                            </CardHeader>
                            <CardBody>
                                <TreeView categories={this.props.categories}/>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs="12" lg="6">
                        <Card>
                            <CardHeader>
                                Revision History
                            </CardHeader>
                            <CardBody>
                                <div style={{height: 1000}}>
                                    <RevisionHistory/>
                                </div>
                            </CardBody>
                        </Card>
                        <Button onClick={() => {
                            alert('zaonssaa');
                            this.props.modalTest();
                        }}>Test</Button>
                    </Col>
                </Row>
            </div>
        );
        return renderValue;
    }
}