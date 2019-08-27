import React from 'react';

const ProductTableHead = () => {
    return (
        <thead>
        <tr>
            <th>ID</th>
            <th>Thumbnail</th>
            <th>name</th>
            <th>type</th>
            <th>SKU</th>
            <th>price</th>
            <th>Date Created</th>
            <th>Date Updated</th>
            <th>Status</th>
            <th>Action</th>
        </tr>
        </thead>
    );
};

export default ProductTableHead;