import base64
import requests
import sys
import asyncio
from pyppeteer import launch
from openai import OpenAI

client = OpenAI()
api_key = "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"

url = sys.argv[1]
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Bearer {api_key}"
}

image_path = ''  # Declare image_path as global variable

# Function to take a screenshot of a webpage

async def take_screenshot(url):
    global image_path  # Declare image_path as global
    # Set up Chrome options
    browser = await launch()
    page = await browser.newPage()
    await page.goto(url)

    # Get the height of the entire page
    body_height = await page.evaluate("document.body.scrollHeight")

    # Set the viewport height to be the same as the page height
    await page.setViewport({"width": 1280, "height": body_height})

    # Take a screenshot of the entire page
    await page.screenshot({'path': 'screenshot.png', 'fullPage': True})

    await browser.close()

    # Set the image path
    image_path = "screenshot.png"


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

async def main():
    url = sys.argv[1]
    await take_screenshot(url)
    base64_image = encode_image(image_path)
    print("URL in Main: ", url)
    # After taking screenshot, proceed with calling OpenAI API
    #
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Extract information about open bids from the webpage provided. Each bid should be identified by its title, status, bid number, start date, and end date. Please ensure that the extracted information is accurate and formatted as a JSON object."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    print(response.json())

asyncio.get_event_loop().run_until_complete(main())

