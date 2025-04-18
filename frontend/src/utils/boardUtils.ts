function clearSquaresStyling(): void {
    for (let square = 0; square <= 63; square++) {
        const squareElement = document.getElementById(`${square}`);
        if (squareElement) {
            squareElement.classList.remove("legal-square");
        }
    }
}

function getRank(square: number | string): number {
    return Math.ceil((Number(square) + 1) / 8 - 1);
}

function getFile(square: number | string): number {
    return Number(square) % 8;
}

function getBoardStartingIndex(row: number, boardOrientation: string): number {
    const whiteOrientationStartingIndex = (row - 1) * 8 + 1;
    const blackOrientationStartingIndex = row * 8;

    const isWhite = boardOrientation.toLowerCase() === "white";

    return isWhite
        ? whiteOrientationStartingIndex
        : blackOrientationStartingIndex;
}

function getBoardEndingIndex(row: number, boardOrientation: string): number {
    const whiteOrientationEndingIndex = row * 8;
    const blackOrientationEndingIndex = (row - 1) * 8 + 1;

    const isWhite = boardOrientation.toLowerCase() === "white";

    return isWhite ? whiteOrientationEndingIndex : blackOrientationEndingIndex;
}

function isSquareLight(square: number | string) {
    const squareFile = getFile(square);
    const squareRank = getRank(square);

    return (squareFile + squareRank) % 2 !== 0;
}

function getSquareExists(square: number | string, boardPlacement: object) {
    return Object.keys(boardPlacement).includes(`${square}`);
}

function isSquareOnFileEdge(square: number, sideToCheck: "top" | "bottom" | "both") {
    if (sideToCheck === "top") {
        return getRank(square) === 0;
    } else if (sideToCheck === "bottom") {
        return getRank(square) === 7;
    } else if (sideToCheck === "both") {
        return getRank(square) in [0, 7];
    }
}

function isSquareOnRankEdge(square: number, sideToCheck: "left" | "right" | "both") {
    if (sideToCheck === "left") {
        return getFile(square) === 0;
    } else if (sideToCheck === "right") {
        return getFile(square) === 7;
    } else if (sideToCheck === "both") {
        return getFile(square) in [0, 7];
    }
}

export {
    clearSquaresStyling,
    getRank,
    getFile,
    getBoardStartingIndex,
    getBoardEndingIndex,
    isSquareLight,
    getSquareExists,
    isSquareOnRankEdge,
    isSquareOnFileEdge,
};
