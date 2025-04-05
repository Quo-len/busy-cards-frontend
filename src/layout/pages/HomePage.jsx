import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MindmapInfo = (props) => {
    const [mindmap, setMindmap] = useState(props.mindmap);

    useEffect(() => {
        const fetchData = async () => {
            const productData = await fetchMindmapById(productId);
            setProduct(productData);
        };


        fetchData();
    }, [productId]);




    

    return (
        <div>
    
        </div>
    );
};

export default MindmapInfo;