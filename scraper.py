import sys
import json
from geopy.geocoders import Nominatim
from scrapeghost import SchemaScraper
import subprocess
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
    models=["gpt-4"],
    auto_split_length=3000,
    extra_instructions=[
        "Include any Bid or Request for Propopsal that has to do with Civil Engineering or Construction",
    ],
)

try:
    print("in try")
    screenshot_response = subprocess.run(["python3", "testScreenshotAnalyze.py", url], capture_output=True)
    print("screenshot_response Response: ", screenshot_response)
    output = screenshot_response.stdout.decode('utf-8')
    print("Response Data: ", output)
    message = response_data['choices'][0]['message']
    print("message;:", message)

    if 'choices' in response_data and len(response_data['choices']) > 0:
        message = response_data['choices'][0]['message']
        print("Message: ", message)
        
        # Now you can access the 'content' inside the 'message' part
        content = message['content']
        print("Message content:", content)
    else:
        print("No 'message' found in response.")


    civil_engineering_topics = ['extension', 'design', 'structural', 'roadway', 'pavement', 'asphalt', 'affordable', 'street', 'cannabis', 'coding', 'recycled', 'transportation', 'bike', 'bike', 'bicycle', 'bicycle', 'lane', 'sidewalk', 'lane', 'pedestrian', 'pedestrian', 'safety', 'bridge', 'design', 'car', 'road', 'street', 'traffic', 'avenue', 'route', 'car-free', 'streets']
    construction_topics = ['construction', 'building', 'contractor', 'subcontractor', 'infrastructure', 'foundation', 'framework', 'materials', 'renovation', 'restoration', 'installation', 'fabrication', 'erection', 'commissioning', 'demolition', 'excavation', 'site development', 'masonry', 'plumbing', 'electrical', 'hvac', 'finishing', 'landscaping', 'project management', 'quality control', 'safety management', 'bidding', 'cost estimate', 'timeline', 'scheduling']
    structural_topics = ['structural', 'loads', 'stress', 'design', 'reinforcement', 'concrete', 'steel', 'timber', 'composites', 'seismic', 'wind', 'foundations', 'walls', 'dynamics', 'codes', 'modeling', 'simulation', 'monitoring', 'forensics', 'failure', 'bridges', 'high-rises', 'earthquake', 'trusses', 'beams', 'columns', 'slabs', 'frames', 'walls', 'connections']

    # topics = ["Transportation", "Banking", "MENTAL", "Proposal", "Prevention", "bike", "bicycle", "lane", "pedestrian", "safety", "bridge", "design", "car", "road", "Street", "Traffic", "avenue", "route", "improve", "curb", "park", "safe", "CAR-FREE", "Streets"]
    
    cleaned_response = []
    for each in screnshot_response.data:
        # contains_topic = any(topic in each['title'] for topic in topics)
        title_to_check = each['title'].lower()
        contains_civil_engineering_topics = any(topic in title_to_check for topic in civil_engineering_topics)
        contains_construction_topics = any(topic in title_to_check for topic in construction_topics)
        contains_structural_topics = any(topic in title_to_check for topic in structural_topics)

        if contains_civil_engineering_topics or contains_construction_topics:
            location = geolocator.geocode(city)
            if location:
                each['geo_location'] = (location.latitude, location.longitude)
                each['city'] = city
                if contains_construction_topics:
                    each['bid_type'] = "construction"
                elif contains_civil_engineering_topics:
                    each['bid_type'] = "civil_engineering"
                else:
                    each['bid_type'] = "structural_engineering"

            cleaned_response.append(each)
    output_json = json.dumps(cleaned_response)
    print(output_json)

except Exception as e:
    print("Couldn't scrape -> ", city)
    sys.exit(1)