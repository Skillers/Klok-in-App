"""
Setup script voor het inklok systeem van ROC-DEV. 
"""

try:
    from adafruit_shell import Shell
except ImportError:
    raise RuntimeError("The library 'adafruit_shell' was not found. To install, try typing: sudo pip3 install adafruit-python-shell")
import os

shell = Shell()
shell.group="Inklok"
default_python = 3
minimum_python_version = 3.9

def default_python_version(numeric=True):
    version = shell.run_command("python -c 'import platform; print(platform.python_version())'", suppress_message=True, return_output=True)
    if numeric:
        try:
            return float(version[0:version.rfind(".")])
        except ValueError:
            return None
    return version

def sys_update():
    print("Updating System Packages")
    if not shell.run_command("sudo apt-get update --allow-releaseinfo-change"):
        shell.bail("Apt failed to update indexes!")
    print("Upgrading packages...")
    if not shell.run_command("sudo apt-get -y upgrade"):
        shell.bail("Apt failed to install software!")

def set_raspiconfig():
    """
    Enable various Raspberry Pi interfaces
    """
    print("Enabling I2C")
    shell.run_command("sudo raspi-config nonint do_i2c 0")
    print("Enabling SPI")
    shell.run_command("sudo raspi-config nonint do_spi 1")
    print("Enabling Serial")
    shell.run_command("sudo raspi-config nonint do_serial 1")
    print("Enabling SSH")
    shell.run_command("sudo raspi-config nonint do_ssh 0")
    print("Enabling Camera")
    shell.run_command("sudo raspi-config nonint do_camera 1")
    print("Disable raspi-config at Boot")
    shell.run_command("sudo raspi-config nonint disable_raspi_config_at_boot 0")

def update_python():
    print("Making sure Python 3 is the default")
    if default_python < 3:
        shell.run_command("sudo apt-get install -y python3 git python3-pip")
        shell.run_command("sudo update-alternatives --install /usr/bin/python python $(which python2) 1")
        shell.run_command("sudo update-alternatives --install /usr/bin/python python $(which python3) 2")
        shell.run_command("sudo update-alternatives --skip-auto --config python")

def update_pip():
    print("Making sure PIP is installed")
    shell.run_command("sudo apt-get install -y python3-pip")
    shell.run_command("sudo pip3 install --upgrade setuptools")

def install_inklok():
    print("Installing latest version of inklok locally")
    shell.run_command("sudo apt-get install -y i2c-tools libgpiod-dev")
    shell.run_command("pip3 install --upgrade RPi.GPIO")
    shell.run_command("pip3 install --upgrade adafruit-blinka")
    shell.run_command("pip3 install --upgrade adafruit-circuitpython-pn532")

def setup_auto_updates():
    shell.run_command("sudo apt install unattended-upgrades")
    os.system("sudo dpkg-reconfigure --priority=low unattended-upgrades")
    shell.clear()

def setup_cron():
    user = os.getlogin()
    os.system("runuser -u " + user + " -- crontab -l > job")
    os.system("echo '@reboot python3 ${PWD}/nfc.py' > job")
    os.system("runuser -u " + user + " -- crontab job")
    os.system("rm job")


def main():
    global default_python
    shell.clear()
    # Check Raspberry Pi and Bail
    pi_model = shell.get_board_model()
    print("This script configures your Raspberry Pi and installs the clock-in system")
    print("{} detected.\n".format(pi_model))
    if not shell.is_raspberry_pi():
        shell.bail("Non-Raspberry Pi board detected. This must be run on a Raspberry Pi")
    os_identifier = shell.get_os()
    if os_identifier != "Raspbian":
        shell.bail("Sorry, the OS detected was {}. This script currently only runs on Raspberry Pi OS.".format(os_identifier))
    if not shell.is_python3():
        shell.bail("You must be running Python 3. Older versions have now been deprecated.")
    shell.check_kernel_update_reboot_required()
    python_version = default_python_version()
    if not python_version:
        shell.warn("WARNING No Default System python tied to the `python` command. It will be set to Version 3.")
        default_python = 0
        if not shell.prompt("Continue?"):
            shell.exit()
    elif default_python_version() < 3:
        shell.warn("WARNING Default System python version is {}. It will be updated to Version 3.".format(default_python_version(False)))
        default_python = 2
        if not shell.prompt("Continue?"):
            shell.exit()
    sys_update()
    set_raspiconfig()
    update_python()
    update_pip()
    install_inklok()
    setup_auto_updates()
    setup_cron()

    # Done
    print("""DONE.

Settings take effect on next boot.
""")
    shell.prompt_reboot()

# Main function
if __name__ == "__main__":
    shell.require_root()
    main()