import React, { useEffect, useRef } from "react";

import "../styles/chessboard/promotion-popup.css";
import { capitaliseFirstLetter } from "../utils/generalUtils.ts";

function PromotionPopup({
    color,
    isOpen,
    onClose,
    handlePromotionCancel,
    handlePawnPromotion,
    boardOrientation
}) {
    const positionClass = boardOrientation.toLowerCase() === color.toLowerCase() ? "top" : "bottom"
    const promotionMenu = useRef(null);

    function handleClickOutside(event) {
        if (
            promotionMenu.current &&
            !promotionMenu.current.contains(event.target)
        ) {
            onClose();
            handlePromotionCancel(color);
        }
    }

    function handlePieceClick(pieceType) {
        handlePawnPromotion(color, capitaliseFirstLetter(pieceType));
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!isOpen) {
        return null;
    }

    function generatePromotionPopup() {
        if (positionClass.toLowerCase() === "top") {
            return (
                <div
                    ref={promotionMenu}
                    className={`promotion-popup-container ${positionClass}`}
                >
                    <img
                        onClick={() => {
                            handlePieceClick("queen");
                        }}
                        src={`/${color.toLowerCase()}Queen.svg`}
                    />

                    <img
                        onClick={() => {
                            handlePieceClick("rook");
                        }}
                        src={`/${color.toLowerCase()}Rook.svg`}
                    />

                    <img
                        onClick={() => {
                            handlePieceClick("knight");
                        }}
                        src={`/${color.toLowerCase()}Knight.svg`}
                    />

                    <img
                        onClick={() => {
                            handlePieceClick("bishop");
                        }}
                        src={`/${color.toLowerCase()}Bishop.svg`}
                    />
                </div>
            );
        } else {
            return (
                <div
                    ref={promotionMenu}
                    className={`promotion-popup-container ${positionClass}`}
                >
                    <img
                        onClick={() => {
                            handlePieceClick("bishop");
                        }}
                        src={`/${color.toLowerCase()}Bishop.svg`}
                    />

                    <img
                        onClick={() => {
                            handlePieceClick("knight");
                        }}
                        src={`/${color.toLowerCase()}Knight.svg`}
                    />

                    <img
                        onClick={() => {
                            handlePieceClick("rook");
                        }}
                        src={`/${color.toLowerCase()}Rook.svg`}
                    />

                    <img
                        onClick={() => {
                            handlePieceClick("queen");
                        }}
                        src={`/${color.toLowerCase()}Queen.svg`}
                    />
                </div>
            );
        }
    }

    return generatePromotionPopup();
}

export default PromotionPopup;
