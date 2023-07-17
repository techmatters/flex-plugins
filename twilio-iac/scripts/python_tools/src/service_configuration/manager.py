import json
from pygments import highlight, lexers, formatters
from termcolor import colored
from .config import config
from .service_configuration import DeepDiff, ServiceConfiguration


def main():
    action = config.action
    for account_sid in config.get_account_sids():
        service_configuration = config.get_service_configuration(
            account_sid)
        print_service_configuration_info(service_configuration)
        globals()[action](service_configuration)


def print_text(text: object):
    if (config.json):
        return

    print(text)


def print_json(structure: object):
    formatted_json = json.dumps(structure, sort_keys=True, indent=4)
    colorful_json: str = highlight(
        formatted_json,
        lexers.JsonLexer(),
        formatters.TerminalFormatter()
    )
    print(colorful_json)


def print_plan(plan: DeepDiff):
    if (config.json):
        print(plan.to_json())
        return

    lines = plan.pretty().split('\n')  # split the diff into lines

    for line in lines:
        if 'added' in line:
            print(colored(line, 'green'))
        elif 'removed' in line:
            print(colored(line, 'red'))
        elif 'changed' in line:
            print(colored(line, 'yellow'))
        else:
            print(line)


def print_service_configuration_info(service_configuration: ServiceConfiguration):
    print_text("\n------------------")
    print_text(f"Environment: {service_configuration.environment}")
    print_text(f"Helpline Code: {service_configuration.helpline_code}")
    print_text(f"Account SID: {service_configuration.account_sid}")
    print_text("")


def show(service_configuration: ServiceConfiguration):
    show_remote(service_configuration)
    show_new(service_configuration)
    plan(service_configuration)


def show_remote(service_configuration: ServiceConfiguration):
    print_text("Remote:")
    print_json(service_configuration.remote_state)


def show_local(service_configuration: ServiceConfiguration):
    print_text("Local:")
    print_json(service_configuration.local_state)


def show_new(service_configuration: ServiceConfiguration):
    print_text("New:")
    print_json(service_configuration.new_state)


def plan(service_configuration: ServiceConfiguration):
    print_text("Plan:")
    print_plan(service_configuration.plan)


def apply(service_configuration: ServiceConfiguration):
    plan(service_configuration)
    if config.dry_run:
        print("Dry run enabled. Exiting...")
        return

    confirm = input(
        f'Do you want to apply these updates to the {service_configuration.helpline_code}-{service_configuration.environment} service configuration? (y/N): ')
    if confirm != 'y':
        print('Please re-run the script to try again')
        print('Exiting...')
        exit(1)

    print('Updating service configuration...')
