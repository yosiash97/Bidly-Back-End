import sys
import json
from geopy.geocoders import Nominatim
from scrapeghost import SchemaScraper

schema = {
    "title": "string",
    "url": "url",
    "Date": "string",
    "Status": "string",
}

url = sys.argv[1]
city = sys.argv[2]
# initialize Nominatim API
geolocator = Nominatim(user_agent="bidly")

episode_scraper = SchemaScraper(
    schema,
    auto_split_length=2000,
    extra_instructions=[
        "Include any Bid or Request for Propopsal that includes the words, Bike, Lane, Pedestrian, Safety, Road",
    ],
)

try:
    response = episode_scraper(url)

    topics = ["Transportation", "Banking", "MENTAL", "Proposal", "Prevention", "bike", "bicycle", "lane", "pedestrian", "safety", "bridge", "design", "car", "road", "Street", "Traffic", "avenue", "route", "improve", "curb", "park", "safe", "CAR-FREE", "Streets"]

    cleaned_response = []
    for each in response.data:
        contains_topic = any(topic in each['title'] for topic in topics)
        if contains_topic:
            location = geolocator.geocode(city)
            if location:
                each['geo_location'] = (location.latitude, location.longitude)
                each['city'] = city
            cleaned_response.append(each)
    output_json = json.dumps(cleaned_response)
    print(output_json)

except Exception as e:
    print("Couldn't scrape -> ", city)
    sys.exit(1)
