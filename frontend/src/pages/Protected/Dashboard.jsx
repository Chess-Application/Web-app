import React, { useEffect, useState } from "react";
import api from "../../api.js";
import Chessboard from "../../globalComponents/Chessboard.jsx";

import "../../styles/dashboard.css";

function Dashboard() {
    const [parsedFEN, setParsedFEN] = useState("");

    useEffect(() => {
        getParsedFEN();
    }, []);

    const positionFEN =
        "rq1nrn1k/8/1p1pNPp1/3PN2b/4Pp1R/p1pB1Qp1/PpPB4/1K6 w - - 0 3";

    function getParsedFEN() {
        api.get("/gameplay_api/parse-fen", {
            params: {
                raw_fen_string: positionFEN,
            },
        })
            .then((response) => response.data)
            .then((data) => {
                setParsedFEN(data);
            })
            .catch((error) => console.log(error));
    }

    return (
        <div className="chessboard-wrapper">
            <Chessboard parsed_fen_string={parsedFEN} orientation="White"/>
        </div>
    );
}

export default Dashboard;
