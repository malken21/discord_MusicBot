import asyncio
import python.main as main
import python.server as server


loop = asyncio.get_event_loop()
loop.run_until_complete(main(), server())