import json
from flask import Flask
from flask_cors import CORS
from boardgamegeek import BGGClient
from boardgamegeek.exceptions import BGGItemNotFoundError

app = Flask(__name__)
CORS(app)

bgg = BGGClient(requests_per_minute=10)

@app.route("/collection/<username>")
def get_collection(username):
    try:
        personal_stats = bgg.collection(username, own=True).items
    except BGGItemNotFoundError:
        print("user {} doesn't appear to exist".format(username))
        return json.dumps([])
    global_stats = [game.data() for game in bgg.game_list(game_id_list=[stats.id for stats in personal_stats])]
    collection = []
    for game in global_stats:
        # remove all games which are not "standalone"
        if game["expands"]:
            continue
        game_dict = game
        for my_game in personal_stats:
            if (my_game.id == game["id"]):
                game_dict["my_rating"] = my_game.rating
                break
        collection.append(game_dict)

    print("user {} has {} games owned".format(username, len(collection)))
    return json.dumps(collection)
