from django.urls import path
from .views import *

urlpatterns = [
	path("parse-fen/", ParseFENView.as_view(), name="parse_fen"),
	path("start-chess-game/", StartChessGameView.as_view(), name="start_chess_game"),
	path("get-ongoing-chess-game/", GetOngoingGameView.as_view(), name="get_ongoing_chess_game"),
	path("make-move-view/<int:pk>", MakeMoveView.as_view(), name="make_move_view"),
	path("get-gameplay-settings/", GetGameplaySettingsView.as_view(), name="get_gameplay_settings"),
	path("update-gameplay-settings/", UpdateSettingsView.as_view(), name="update_gameplay_settings")
]