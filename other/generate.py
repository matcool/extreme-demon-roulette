import gd
import json
import zlib

data = {
    'insane': [],
    'hard': []
}

client = gd.Client()
# hardcoded page count idc theres no way to get them with gd.py (right now)
levels = client.run(client.search_levels(filters=gd.Filters(demon_difficulty=gd.DemonDifficulty.INSANE_DEMON), pages=range(90)))
for level in levels:
    data['insane'].append({
        'id': level.id,
        'name': level.name,
        'creator': level.creator.name,
        'diff': 'insane'
    })

levels = client.run(client.search_levels(filters=gd.Filters(demon_difficulty=gd.DemonDifficulty.HARD_DEMON), pages=range(112)))
for level in levels:
    data['hard'].append({
        'id': level.id,
        'name': level.name,
        'creator': level.creator.name,
        'diff': 'hard'
    })

with open('data.bin', 'wb') as file:
    dump = json.dumps(data, separators=(',', ':'))
    print(len(dump))
    file.write(zlib.compress(dump.encode()))