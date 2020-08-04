from aiohttp import web, ClientSession
import asyncio
import json
import time
import datetime
import aiohttp_cors

def json_response(obj):
    return web.Response(text=json.dumps(obj), content_type='application/json')

def missing_parameters():
    return web.Response(status=422)

cache = []
last_update = None

async def get_demon_list(after: int=0, limit: int=100):
    async with ClientSession() as session:
        async with session.get(f'https://pointercrate.com/api/v1/demons/?limit={limit}&after={after}') as resp:
            if resp.status != 200: return
            data = await resp.json()
            return list(map(lambda demon: {
                'position': demon['position'],
                'name': demon['name'],
                'publisher': demon['publisher']['name'],
                'video': demon['video'][-11:] if demon['video'] and 'youtube' in demon['video'] else None
            }, data))

async def update_cache():
    print(f'[{datetime.datetime.now()}] Updating cache')
    global last_update, cache
    last_update = time.time()
    # great naming i know im trying to make this as fast as possible
    part1 = await get_demon_list(0, 100)
    part2 = await get_demon_list(100, 100)
    part3 = await get_demon_list(200, 100)
    # lets hope this doesnt happen on the first caching
    if not all((part1, part2, part3)):
        return
    cache = [*part1, *part2, *part3]

def should_update():
    return last_update is None or time.time() - last_update > 30 * 60

async def main_list(request):
    if should_update():
        await update_cache()
    if not len(cache):
        # lets hope this doesnt happen
        return web.Response(status=500)
    return json_response(cache[:75])

async def extended_list(request):
    if should_update():
        await update_cache()
    if not len(cache):
        return web.Response(status=500)
    return json_response(cache[75:150])

async def legacy_list(request):
    if should_update():
        await update_cache()
    if not len(cache):
        return web.Response(status=500)
    return json_response(cache[150:])

app = web.Application()

app.add_routes([
    web.get('/mainlist', main_list),
    web.get('/extendedlist', extended_list),
    web.get('/legacylist', legacy_list),
])

cors = aiohttp_cors.setup(app, defaults={
    # 'https://matcool.github.io/extreme-demon-roulette/': aiohttp_cors.ResourceOptions(allow_methods=['GET']),
    '*': aiohttp_cors.ResourceOptions(allow_credentials=True, expose_headers="*", allow_headers="*")
})

for route in list(app.router.routes()):
    print(route)
    cors.add(route)

web.run_app(app)
