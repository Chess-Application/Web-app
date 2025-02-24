from typing import TypedDict
from general import *
from enums import PieceType

files_list = ["a", "b", "c", "d", "e", "f", "g", "h"]
piece_notation_mapping = {
    PieceType.ROOK.value: "r",
    PieceType.BISHOP.value: "b",
    PieceType.KNIGHT.value: "n",
    PieceType.KING.value: "k",
    PieceType.QUEEN.value: "q"
}


class MoveInfo(TypedDict):
    starting_square: str | int
    destination_square: str | int
    piece_type: str
    piece_color: str


def handle_pawn_move(move_info: MoveInfo):
    starting_square = move_info["starting_square"]
    destination_square = move_info["destination_square"]

    start_file = get_file(int(starting_square))
    end_rank = get_row(int(destination_square))

    file_letter = files_list[start_file]

    return f"{file_letter}{end_rank}"


def handle_piece_move(move_info: MoveInfo):
    destination_square = move_info["destination_square"]
    piece_type = move_info["piece_type"]
    piece_notation = piece_notation_mapping[piece_type.lower()]

    return f"{piece_notation.upper()}{convert_to_algebraic_notation(destination_square)}"


def parse_algebraic_notation(board_placement: dict, move_info: MoveInfo) -> str:
    piece_type = move_info["piece_type"].lower()

    if piece_type == PieceType.PAWN.value:
        return handle_pawn_move(move_info)

    else:
        return handle_piece_move(move_info)


parsed_rook_notation = parse_algebraic_notation({}, {
    "starting_square": 12,
    "destination_square": 44,
    "piece_type": "Queen",
    "piece_color": "white"
})
