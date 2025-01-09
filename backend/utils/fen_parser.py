letter_to_piece_mapping = {
	"q": "Queen",
	"r": "Rook",
	"b": "Bishop",
	"n": "Knight",
	"k": "King",
	"p": "Pawn"
}

def parse_board_placement(board_placement_string: str):
	current_square_index = 63
	current_rank = 8

	piece_placements = {}

	for character in board_placement_string:
		if character.isalpha() and character != "/":
			piece_color = "White" if character.isupper() else "Black"
			piece_type = letter_to_piece_mapping[character.lower()]

			piece_placements[f"{current_square_index}"] = {
				"color": piece_color,
				"piece": piece_type
			}

			current_square_index -= 1
		
		elif character.isdigit():
			current_square_index -= int(character)

		elif character == "/":
			current_rank -= 1
			current_square_index = (8 * current_rank) - 1

	return piece_placements

def parse_side_to_move(side_to_move):
	return "White" if side_to_move == "w" else "Black"


def parse_fen(fen_string: str):
	fen_string_segments = fen_string.split(" ")
	if len(fen_string_segments) != 6:
		return "Invalid FEN!"
	
	board_placement_string = fen_string_segments[0]
	side_to_move = fen_string_segments[1]
	castling_rights = fen_string_segments[2]
	en_passant_target_square = fen_string_segments[3]
	halfmove_clock = fen_string_segments[4]
	fullmove_number = fen_string_segments[5]
	
	parsed_board_placement_string = parse_board_placement(board_placement_string)
	parsed_side_to_move = parse_side_to_move(side_to_move)

	return {
		"board_placement": parsed_board_placement_string,
		"side_to_move": parsed_side_to_move
	}

	
print(parse_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"))