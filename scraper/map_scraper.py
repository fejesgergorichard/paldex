from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from PIL import Image
import requests
import time

apiUrl = 'http://localhost/api/?limit=300'
response = requests.get(apiUrl)
if response.status_code == 200:
    pals = response.json()['content']
else:
    print(f"Failed to fetch data: {response.status_code}")
    pals = []

# # Problematic rows
# pals = [
#     {'name': "Xenolord", 'key': "127"},
#     {'name': "Nyafia", 'key': "139"}, 
#     {'name': "Warsect", 'key': "092"}
# ]

driver = webdriver.Chrome() 

driver.get('https://palworld.gg/map')

def acceptCookieConsent(driver):
    wait = WebDriverWait(driver, 3)
    cookie_consent_button = wait.until(
    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Accept')]"))
)
    cookie_consent_button.click()

def disableLocations(driver):
    pals_locations_span = driver.find_element(By.XPATH, "//div[@class='pals-heatmap']")
    pals_locations_span.click()
    fast_travel = driver.find_element(By.XPATH, "//div[contains(text(), 'Fast Travel')]")
    fast_travel.click()
    syndicate = driver.find_element(By.XPATH, "//div[contains(text(), 'Syndicate Tower')]")
    syndicate.click()
    alpha = driver.find_element(By.XPATH, "//div[contains(text(), 'Alpha Pals')]")
    alpha.click()

def cropImage(screenshot_path):
    image = Image.open(screenshot_path)

    left = 540
    upper = 170
    right = 1500
    lower = 1100

    cropped_image = image.crop((left, upper, right, lower))
    cropped_image.save(screenshot_path)

def saveImageForPalName(driver, pal_name, key):
    pal_element = driver.find_element(By.XPATH, f"//div[contains(text(),'{pal_name}')]")
    pal_element.click()
    time.sleep(1)

    screenshot_path = f"maps/{key}.png"
    driver.save_screenshot(screenshot_path)
    print(f"Screenshot saved for {pal_name} at {screenshot_path}")
    return screenshot_path


acceptCookieConsent(driver)
disableLocations(driver)

for pal in pals:
    pal_name = pal['name']
    pal_key = pal['key']
    try:
        screenshot_path = saveImageForPalName(driver, pal_name, pal_key)
        cropImage(screenshot_path)

    except Exception as e:
        print(f"Error capturing screenshot for {pal}: {e}")

driver.quit()
