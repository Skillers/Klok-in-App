import board
import busio
import time
import os
import RPi.GPIO as GPIO
import requests
import logging
from adafruit_pn532.i2c import PN532_I2C
from adafruit_pn532.adafruit_pn532 import MIFARE_CMD_AUTH_A

SUCCESS = 26
ERROR = 19

BUZZER = 23
SHUTDOWNBUTTON = 24
REBOOTBUTTON = 18

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

GPIO.setup(SUCCESS, GPIO.OUT)
GPIO.setup(ERROR, GPIO.OUT)
GPIO.setup(BUZZER, GPIO.OUT)

GPIO.setup(SHUTDOWNBUTTON, GPIO.IN)
GPIO.setup(REBOOTBUTTON, GPIO.IN)

GPIO.add_event_detect(SHUTDOWNBUTTON, GPIO.RISING, callback=lambda c: os.system("shutdown -h now"))
GPIO.add_event_detect(REBOOTBUTTON, GPIO.RISING, callback=lambda c: os.system("reboot"))

i2c = busio.I2C(board.SCL, board.SDA)

pn532 = PN532_I2C(i2c, debug=False)

keya = [0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5]

url = "https://roc-dev.tech/API/inklok_uitklok.php"

logging.basicConfig(filename="clock_in.log", level=logging.DEBUG, format="%(asctime)s %(levelname)s: %(message)s", datefmt="%d-%m-%Y %H:%M:%S")

def buzz(channel):
    GPIO.output(BUZZER, GPIO.HIGH)
    time.sleep(0.3)
    GPIO.output(BUZZER, GPIO.LOW)

def wait_for_connection():
    connected = False
    while not connected:
        try:
            requests.get("https://8.8.8.8", timeout=5)
            connected = True
        except (requests.ConnectionError, requests.Timeout):
            logging.debug("Waiting for connection")
            time.sleep(5)

def dec_from_hex(data):
    res = [None] * 9
    for i in range(5):
        if i * 2 < 8:
            res[i * 2 + 1] = int(data[i] % 16)
        res[i * 2] = int((data[i] / 16) % 16)
    return "".join(str(num) for num in res)

def read_card(uid: str):
    auth_status = pn532.mifare_classic_authenticate_block(uid, 4, MIFARE_CMD_AUTH_A, keya)
    if not auth_status:
        return None
    logging.debug(f'Authstatus: {auth_status}')
    
    response = pn532.mifare_classic_read_block(4)
    if response is None:
        return None
    dec_res = dec_from_hex(response)
    logging.debug(f"Studentnummer: {dec_res}")
    return int(dec_res)
    
def send_clock_in_data(nummer):
    data = {"nfc_chipnr": nummer}
    res = requests.post(url, json=data)
    return res
        
def error():
    GPIO.output(ERROR, GPIO.HIGH)
    time.sleep(1)
    GPIO.output(ERROR, GPIO.LOW)
    time.sleep(1)
    GPIO.output(ERROR, GPIO.HIGH)
    time.sleep(1)
    GPIO.output(ERROR, GPIO.LOW)
    
def main():
    last_uid = "000000000"
    
    logging.info("Starting application")

    GPIO.output(ERROR, GPIO.HIGH)

    wait_for_connection()

    GPIO.output(ERROR, GPIO.LOW)

    while True:
        uid = pn532.read_passive_target(timeout=0.5)
 
        if uid is None:
            continue
        
        if uid == last_uid:
            logging.info(f"Double read card {[hex(i) for i in uid]}")
            error()
            continue

        GPIO.output(SUCCESS, GPIO.HIGH)
        logging.debug(f'Found card with UID: {[hex(i) for i in uid]}')
        student_number = read_card(uid)

        if student_number is None:
            GPIO.output(SUCCESS, GPIO.HIGH)
            continue

        res = send_clock_in_data(student_number)
                
        if res.status_code == 404:
            logging.error("Server error")
            error()
            GPIO.output(SUCCESS, GPIO.LOW)
        elif res.status_code == 500:
            logging.error(f"Student not fount {student_number}")
            error()
            GPIO.output(SUCCESS, GPIO.LOW)
        elif res.status_code == 200:
            last_uid = uid
            time.sleep(1)
            GPIO.output(SUCCESS, GPIO.LOW)
        else:
            logging.error(f"Error communicating with server {res.status_code}")
            error()
            GPIO.output(SUCCESS, GPIO.LOW)
            
    
if __name__ == "__main__":
    main()
