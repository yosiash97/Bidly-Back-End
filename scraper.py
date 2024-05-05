import sys
import json
from geopy.geocoders import Nominatim
from scrapeghost import SchemaScraper
import logging

logging.basicConfig(filename='scraper.log', level=logging.DEBUG)
logging.debug(f"Initial Logging")


schema = {
    "title": "string",
    "url": "url",
    "Date": "string",
    "Status": "string",
}

url = sys.argv[1]
city = sys.argv[2]
logging.debug(f"After SYS Args")
# initialize Nominatim API
geolocator = Nominatim(user_agent="bidly")
logging.debug(f"After geologger")

episode_scraper = SchemaScraper(
    schema,
    auto_split_length=2000,
    extra_instructions=[
        "Include any Bid or Request for Propopsal that has to do with Civil Engineering or Construction",
    ],
)

logging.debug(f"After episode scraper")

try:
    logging.debug(f"in try")
    response = episode_scraper(url)

    civil_engineering_topics = ['Affordable', 'Street', 'Cannabis', 'Coding', 'Recycled','Transportation', 'bike', 'Bike', 'bicycle', 'Bicycle', 'lane', 'Sidewalk', 'Lane', 'Pedestrian', 'pedestrian', 'safety', 'bridge', 'design', 'car', 'road', 'street', 'traffic', 'avenue', 'route', 'CAR-FREE', 'streets']
    construction_topics = ['MENTAL', 'roofing', 'inspection', 'repair', 'elevator', 'infrastructure', 'construction']
    # topics = ["Transportation", "Banking", "MENTAL", "Proposal", "Prevention", "bike", "bicycle", "lane", "pedestrian", "safety", "bridge", "design", "car", "road", "Street", "Traffic", "avenue", "route", "improve", "curb", "park", "safe", "CAR-FREE", "Streets"]
    
    cleaned_response = []
    logging.debug(f"Response data: {response.data}")
    for each in response.data:
        # contains_topic = any(topic in each['title'] for topic in topics)
        contains_civil_engineering_topics = any(topic in each['title'] for topic in civil_engineering_topics)
        contains_construction_topics = any(topic in each['title'] for topic in construction_topics)

        if contains_civil_engineering_topics or contains_construction_topics:
            location = geolocator.geocode(city)
            if location:
                each['geo_location'] = (location.latitude, location.longitude)
                each['city'] = city
                if contains_construction_topics:
                    each['bid_type'] = "construction"
                else:
                    each['bid_type'] = "civil_engineering"
            cleaned_response.append(each)
    output_json = json.dumps(cleaned_response)
    logging.debug(f"Output JSON: {output_json}")
    print(output_json)

except Exception as e:
    print("Couldn't scrape -> ", city)
    sys.exit(1)
