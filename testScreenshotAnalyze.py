import base64
import requests
import sys
import asyncio
from pyppeteer import launch

# Set your API key here
api_key = "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"

# Function to take a screenshot of elements containing specific keywords
async def take_keyword_screenshots(url, keyword, path_prefix):
    # Set up Chrome options
    browser = await launch()
    page = await browser.newPage()
    await page.goto(url, {'waitUntil': 'networkidle2'})

    # Adjust the zoom level dynamically to ensure the screenshot is readable
    await page.evaluate('document.body.style.zoom = "2"')

    # Find elements containing the keyword
    elements = await page.querySelectorAllEval(
        '*', 
        f'elements => elements.filter(element => element.innerText && element.innerText.includes("{keyword}")).map(element => element.getBoundingClientRect())'
    )

    # Debug: Print the rect objects
    print("Found elements:", elements)

    # Take screenshots of each element
    screenshot_paths = []
    padding = 100  # Add padding to capture surrounding content
    for i, rect in enumerate(elements):
        try:
            path = f'{path_prefix}_{i + 1}.png'
            await page.screenshot({
                'path': path,
                'clip': {
                    'x': max(rect['x'] - padding, 0),
                    'y': max(rect['y'] - padding, 0),
                    'width': rect['width'] + 2 * padding,
                    'height': rect['height'] + 2 * padding
                }
            })
            screenshot_paths.append(path)
        except KeyError as e:
            print(f"KeyError: {e} in rect {rect}")

    await browser.close()
    return screenshot_paths

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

async def main(url):
    # Take screenshots of elements containing the keywords
    keywords = ["RFP", "bid"]
    screenshot_paths = []
    for keyword in keywords:
        paths = await take_keyword_screenshots(url, keyword, f'screenshot_{keyword}')
        screenshot_paths.extend(paths)

    base64_images = [encode_image(path) for path in screenshot_paths]

    # Create the messages with the base64 images
    messages = [
        {"role": "user", "content": "Extract information about open bids from the webpage provided. Each bid should be identified by its title, status, bid number, start date, and end date. Please ensure that the extracted information is accurate and formatted as a JSON object."}
    ]
    
    for base64_image in base64_images:
        messages.append({"role": "user", "content": f"data:image/jpeg;base64,{base64_image}"})

    payload = {
        "model": "gpt-4",
        "messages": messages,
        "max_tokens": 600
    }

    headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {api_key}"
    }
    
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    print(response.json())

if __name__ == '__main__':
    url = sys.argv[1]

    # Ensure there's an event loop available
    loop = asyncio.get_event_loop()
    if not loop.is_running():
        loop.run_until_complete(main(url))
    else:
        loop.create_task(main(url))
