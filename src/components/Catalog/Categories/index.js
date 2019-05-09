import React, {Component} from 'react';
import Loadable from 'react-loadable';
import {Card, CardBody, CardHeader, Col, Row} from "reactstrap";
import Loading from "../../Loading";

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
                                    <RevisionHistory submitingId={0}/>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
        return renderValue;
    }
}