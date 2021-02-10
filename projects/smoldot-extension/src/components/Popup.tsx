import React from 'react';

const Popup: React.FunctionComponent = () => {
	return (
        <>
            <div style={{
                width: '400px',
                height: '300px'
            }}>Popup Main page</div>
            <a href='chrome-extension://amdibihpdpaflbfchfnamgflcmngmmgp/options.html' target='_blank'>options</a>
        </>
	);
};

export default Popup;
