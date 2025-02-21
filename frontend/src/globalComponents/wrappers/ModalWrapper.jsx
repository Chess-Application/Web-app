import ReactDom from "react-dom";

import "../../styles/wrappers/modal-wrapper.css"

function ModalWrapper({ children, visible }) {
    if (!visible) {
        return null;
    }

    return ReactDom.createPortal(
        <div className="modal-wrapper">
            <div className="modal-overlay"></div>
            {children}
        </div>,
        document.getElementById("portal")
    );
}

export default ModalWrapper;