import json
import os
from pygments import highlight, lexers, formatters
from termcolor import colored
from .config import config
from .remote_syncer import RemoteSyncer
from .service_configuration import DeepDiff, ServiceConfiguration, get_dot_notation_path
from .remote_syncer import RemoteSyncer


def main():
    try:
        if config.argument == 'service_config':
            run_service_config_action()
        elif config.argument == 'syncer':
            run_sync_action()
        else:
            raise Exception('Invalid argument configuration')
        cleanup_and_exit()
    except KeyboardInterrupt:
        print("\nCaught Ctrl+C. Program exiting...")
        cleanup_and_exit(1)


def run_service_config_action():
    action = config.action
    for account_sid in config.get_account_sids():
        service_config = config.get_service_config(
            account_sid)
        print_service_config_info(service_config)
        globals()[action](service_config)


def run_sync_action():
    action = config.action
    for syncer in config.syncers:
        globals()[action](syncer)


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
            path = get_dot_notation_path(change)
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
        print_text('Dry run enabled.')
        return

    if not service_config.plan:
        return

    confirm = input(
        f'Do you want to apply these updates to the {service_config.helpline_code}-{service_config.environment} service configuration? (y/N): ')
    if confirm != 'y':
        print_text('Please re-run the script to try again')
        cleanup_and_exit(1)

    print_text('Updating service configuration...')
    service_config.apply()


def sync_plan(syncer: RemoteSyncer):
    print_text('Config json updates:\n\n')
    show_common = True
    for service_config in syncer.service_configs.values():
        if (show_common):
            print_text(service_config.get_config_path('common'))
            print_json(syncer.configs['common'])
            show_common = False

        print_text(service_config.get_config_path('environment'))
        print_json(syncer.configs[service_config.environment])



def sync_apply(syncer: RemoteSyncer):
    sync_plan(syncer)

    confirm = input(
        'Do you want to make these updates to the files above? (y/N): ')
    if confirm != 'y':
        print_text('Please re-run the script to try again')
        cleanup_and_exit(1)

    print_text('Updating service configuration...')
    write_common = True
    for service_config in syncer.service_configs.values():
        if (write_common):
            dir_path = os.path.dirname(service_config.get_config_path('common'))
            os.makedirs(dir_path, exist_ok=True)
            with open(service_config.get_config_path('common'), 'w') as f:
                json.dump(syncer.configs['common'], f, indent=4, sort_keys=True)
            write_common = False

        with open(service_config.get_config_path('environment'), 'w') as f:
            json.dump(syncer.configs[service_config.environment], f, indent=4, sort_keys=True)


def unlock(service_config: ServiceConfiguration):
    print_text('Unlocking service configuration...')
    service_config.cleanup()


def cleanup_and_exit(code: int = 0):
    print_text('Cleaning up...')
    config.cleanup()
    exit(code)
