"""
Copyright (c) 2023 K-Bean Studios

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

You may not distribute or modify this script without proper credit to K-Bean Studios.
"""
import discord
from discord import app_commands
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# Is the bot active? 0 = false 1 = true
active = 0

# Create an instance of Intents
intents = discord.Intents.default()

# Create an instance of the bot
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

# Command to get the weather
@tree.command(name="activate", description="Get the current weather for a location")
async def get_weather(ctx: discord.Interaction):

    ctx.response.defer()
    # Retrieve user ID from the interaction
    user_id = ctx.user.id

    # Activate bot
    active = 1
    
    await ctx.followup.send("bot now active")

# Event to print a message when the bot is ready
@client.event
async def on_ready():
    await tree.sync()
    print(f'{client.user.name} has connected to Discord!')

# Run the bot
client.run(DISCORD_TOKEN, reconnect=True)
