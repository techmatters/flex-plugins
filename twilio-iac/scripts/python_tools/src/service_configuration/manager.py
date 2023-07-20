import json
from pygments import highlight, lexers, formatters
from termcolor import colored
from .config import config
from .remote_syncer import RemoteSyncer
from .service_configuration import DeepDiff, ServiceConfiguration


def main():
    if config.all_env_action:
        run_all_env_action()
        return

    run_account_sid_action()


def run_account_sid_action():
    action = config.action
    for account_sid in config.get_account_sids():
        service_config = config.get_service_config(
            account_sid)
        print_service_config_info(service_config)
        globals()[action](service_config)


def run_all_env_action():
    action = config.action
    for helpline_code, service_configs in config.helplines.items():
        globals()[action](helpline_code, service_configs)


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

    if (not plan):
        print('No changes.')
        return

    output = []
    for diff_type, changes in plan.items():
        for change in changes:
            path = change.path().replace("root[", "").replace("][", ".").replace("]", "").replace("'", "")
            if diff_type == 'dictionary_item_added':
                output.append(f'Add {path} with value {change.t2}')
            elif diff_type == 'dictionary_item_removed':
                output.append(f'Remove {path} with value {change.t1}')
            elif diff_type == 'values_changed':
                output.append(f'Update {path} from {change.t1} to {change.t2}')


    for line in output:
        if 'Add' in line:
            print(colored(line, 'green'))
        elif 'Remove' in line:
            print(colored(line, 'red'))
        elif 'Update' in line:
            print(colored(line, 'yellow'))
        else:
            print(line)


def print_service_config_info(service_config: ServiceConfiguration):
    print_text("\n------------------")
    print_text(f"Environment: {service_config.environment}")
    print_text(f"Helpline Code: {service_config.helpline_code}")
    print_text(f"Account SID: {service_config.account_sid}")
    print_text("")


def show(service_config: ServiceConfiguration):
    show_remote(service_config)
    show_local(service_config)
    show_new(service_config)
    plan(service_config)


def show_remote(service_config: ServiceConfiguration):
    print_text("Remote:")
    print_json(service_config.remote_state)


def show_local(service_config: ServiceConfiguration):
    print_text("Local:")
    print_json(service_config.local_state)


def show_new(service_config: ServiceConfiguration):
    print_text("New:")
    print_json(service_config.new_state)


def plan(service_config: ServiceConfiguration):
    print_text("Plan:")
    print_plan(service_config.plan)


def apply(service_config: ServiceConfiguration):
    plan(service_config)
    if config.dry_run:
        print('Dry run enabled. Exiting...')
        return

    confirm = input(
        f'Do you want to apply these updates to the {service_config.helpline_code}-{service_config.environment} service configuration? (y/N): ')
    if confirm != 'y':
        print('Please re-run the script to try again')
        print('Exiting...')
        exit(1)

    print('Updating service configuration...')


def sync_plan(helpline_code: str, service_configs: dict[str, ServiceConfiguration]):
    print('Syncing remote state with local state...')
    remote_syncer = RemoteSyncer(
        helpline_code=helpline_code,
        service_configs=service_configs
    )
    print('Done.')
