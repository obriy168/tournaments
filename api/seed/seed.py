import asyncio

async def create_admin():
    await asyncio.sleep(10)

async def create_tournaments():
    await asyncio.sleep(10)



asyncio.run(create_admin())
asyncio.run(create_tournaments())