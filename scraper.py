import sys
import json
from selenium import webdriver
import requests
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from geopy.geocoders import Nominatim
from bs4 import BeautifulSoup
from scrapeghost import SchemaScraper
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Schema definition
schema = {
    "title": "string",
    "url": "url",
    "Date": "string",
    "Status": "string",
}

def parse_react_table(soup):
    react_table = soup.select_one("div#root div.ReactTable")
    if not react_table:
        sys.stderr.write("ReactTable not found in the HTML\n")
        return []

    data = []
    rows = react_table.find_all("div", class_="rt-tr-group")
    for row in rows:
        row_data = []
        cells = row.find_all("div", class_="rt-td")
        for cell in cells:
            cell_text = cell.get_text(strip=True)
            row_data.append(cell_text)
        if row_data:
            data.append(row_data)

    return data

def preprocess_html(html):
    soup = BeautifulSoup(html, "lxml")
    tables = soup.find_all('table')
    
    # Collect data from traditional tables
    new_soup = BeautifulSoup("", "lxml")
    for table in tables:
        new_soup.append(table)

    # Collect data from React tables
    react_table_data = parse_react_table(soup)
    if react_table_data:
        react_table_str = json.dumps(react_table_data, indent=4)
        new_soup.append(BeautifulSoup(f"<pre>{react_table_str}</pre>", "lxml"))

    return str(new_soup)

def fetch_page_with_selenium(url):
    options = Options()
    options.headless = True
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    driver.get(url)

    # Wait for the React table to be present
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div#root div.ReactTable"))
        )
    except Exception as e:
        sys.stderr.write("Timeout waiting for ReactTable to load\n")
        driver.quit()
    finally:
        driver.quit()

    html = driver.page_source
    driver.quit()
    
    return html

def main(url, city):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 Vivaldi/5.3.2679.70."
    }
    try:
        try: 
            html = fetch_page_with_selenium(url)
        except Exception as e:
            sys.stderr.write(f"Tried to scrape with selenium, no react table.... doing html scrape now.")
            response_check = requests.get(url, headers=headers)
            print('response check status', response_check.status_code)
        
            if response_check.status_code == 200:
                html = response_check.text
                print("Html in if: ", html)
            print(f"HTML fetched: {len(html)} characters")

        print("html outside scoep: ", html)
        cleaned_html = preprocess_html(html)



        geolocator = Nominatim(user_agent="bidly")
        episode_scraper = SchemaScraper(
            schema,
            models=["gpt-4"],
            auto_split_length=3000,
            extra_instructions=[
                "Include any Bid or Request for Proposal that has to do with Civil Engineering or Construction",
            ],
        )

        response = episode_scraper(cleaned_html)

        civil_engineering_topics = [
            'extension', 'design', 'structural', 'roadway', 'pavement', 'asphalt',
            'affordable', 'street', 'cannabis', 'coding', 'recycled',
            'transportation', 'bike', 'bicycle', 'lane', 'sidewalk', 'pedestrian',
            'safety', 'bridge', 'car', 'road', 'traffic', 'avenue', 'route',
            'car-free', 'streets'
        ]
        construction_topics = [
            'construction', 'building', 'contractor', 'subcontractor',
            'infrastructure', 'foundation', 'framework', 'materials', 'renovation',
            'restoration', 'installation', 'fabrication', 'erection', 'commissioning',
            'demolition', 'excavation', 'site development', 'masonry', 'plumbing',
            'electrical', 'hvac', 'finishing', 'landscaping', 'project management',
            'quality control', 'safety management', 'bidding', 'cost estimate',
            'timeline', 'scheduling'
        ]
        structural_topics = [
            'structural', 'loads', 'stress', 'reinforcement', 'concrete', 'steel',
            'timber', 'composites', 'seismic', 'wind', 'foundations', 'walls',
            'dynamics', 'codes', 'modeling', 'simulation', 'monitoring', 'forensics',
            'failure', 'bridges', 'high-rises', 'earthquake', 'trusses', 'beams',
            'columns', 'slabs', 'frames', 'connections'
        ]

        cleaned_response = []
        
        for each in response.data:
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

        # Print only the final processed data as JSON
        print(json.dumps(cleaned_response, indent=4))
    except Exception as e:
        sys.stderr.write(f"Couldn't scrape -> {city}\n")
        sys.stderr.write(f"Error: {e}\n")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.stderr.write("Usage: python scraper.py <URL> <City>\n")
        sys.exit(1)
    url = sys.argv[1]
    city = sys.argv[2]
    main(url, city)
