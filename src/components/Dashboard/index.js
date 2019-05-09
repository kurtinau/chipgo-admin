import React, {Component} from 'react';
import {Col, Row} from "reactstrap";

export default class Dashboard extends Component {
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" sm="6" lg="3">
                      <p>I am Dashboard</p>
                    </Col>
                </Row>
            </div>
        )
    }
}