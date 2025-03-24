#!/usr/bin/env python3
import json
import os
import argparse

def generate_intent_files(bot_definition_path, template_path, output_dir):
    # Load bot definition
    with open(bot_definition_path, 'r', encoding='utf-8') as f:
        bot_definition = json.load(f)
    
    # Load template
    with open(template_path, 'r', encoding='utf-8') as f:
        template = json.load(f)
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    # Ensure output directory exists
    intent_dir = os.path.join(output_dir, "intents")
    os.makedirs(intent_dir, exist_ok=True)
    
    # Extract intents
    for bot_name, bot_config in bot_definition.items():
        for intent_name, intent_data in bot_config.get("intents", {}).items():
            intent_json = template.copy()
            intent_json["intentName"] = intent_name
            intent_json["description"] = bot_config.get("description", "")
            
            # Add initial response if exists
            if "initial_response" in intent_data:
                intent_json["initialResponseSetting"] = template["initialResponseSetting"].copy()
                intent_json["initialResponseSetting"]["initialResponse"]["messageGroups"][0]["message"]["plainTextMessage"]["value"] = intent_data["initial_response"]["message"]
                intent_json["initialResponseSetting"]["codeHook"]["postCodeHookSpecification"]["successNextStep"]["dialogAction"]["slotToElicit"] = intent_data["initial_response"]["slot_to_elicit"]
            else:
                del intent_json["initialResponseSetting"]  # Remove section if missing
            # Add closing response if exists
            if "closing_response" in intent_data:
                intent_json["intentClosingSetting"] = template["intentClosingSetting"].copy()
                intent_json["intentClosingSetting"]["closingResponse"]["messageGroups"][0]["message"]["plainTextMessage"]["value"] = intent_data["closing_response"]["message"]
            else:
                del intent_json["intentClosingSetting"]  # Remove section if missing
            # Add slot priorities
            slot_priorities = []
            for priority, slot in intent_data.get("slot_priorities", {}).items():
                slot_priorities.append({"priority": int(priority), "slotName": slot["slot_name"]})
            intent_json["slotPriorities"] = sorted(slot_priorities, key=lambda x: x["priority"])
            
            # Save to file
            output_path = os.path.join(intent_dir, f"{intent_name}.json")
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(intent_json, f, indent=4, ensure_ascii=False)
            print(f"Generated {output_path}")


def generate_slot_files(bot_definition_path, template_path, output_dir):
    # Load bot definition
    with open(bot_definition_path, 'r', encoding='utf-8') as f:
        bot_definition = json.load(f)
    
    # Load slot template
    with open(template_path, 'r', encoding='utf-8') as f:
        slot_template = json.load(f)
    
     # Ensure output directory exists
    slot_dir = os.path.join(output_dir, "slots")
    os.makedirs(slot_dir, exist_ok=True)
    
    # Iterate over intents and slots
    for intent_name, intent_data in bot_definition.items():
        if "intents" in intent_data:
            for intent, details in intent_data["intents"].items():
                if "slot_priorities" in details:
                    for _, slot in details["slot_priorities"].items():
                        slot_name = slot["slot_name"]
                        slot_type_name = slot["slot_type_name"]
                        question = slot["slot_question"]
                        
                        # Fill in the template
                        slot_json = slot_template.copy()
                        slot_json["slotName"] = slot_name
                        slot_json["slotTypeName"] = slot_type_name
                        slot_json["intentName"] = intent
                        slot_json["description"] = f"Slot {slot_name} for intent {intent}"
                        slot_json["valueElicitationSetting"]["promptSpecification"]["messageGroups"][0]["message"]["plainTextMessage"]["value"] = question
                        
                        # Save to file
                        output_path = os.path.join(slot_dir, f"{slot_name}.json")
                        with open(output_path, 'w', encoding='utf-8') as f:
                            json.dump(slot_json, f, indent=4, ensure_ascii=False)
                        
                        print(f"Generated: {output_path}")


def generate_slot_type_files(bot_definition_path, template_path, output_dir):
    # Load bot definition
    with open(bot_definition_path, "r", encoding="utf-8") as bot_file:
        bot_definition = json.load(bot_file)

    # Load slot type template
    with open(template_path, "r", encoding="utf-8") as template_file:
        slot_type_template = json.load(template_file)

    # Extract unique slot type names from slot_priorities
    slot_types = set()
    for intent_data in bot_definition.values():
        for intent in intent_data.get("intents", {}).values():
            for slot in intent.get("slot_priorities", {}).values():
                slot_types.add(slot["slot_type_name"])

    # Ensure output directory exists
    slot_type_dir = os.path.join(output_dir, "slot_types")
    os.makedirs(slot_type_dir, exist_ok=True)

    # Generate JSON files for each slot type
    for slot_type_name in slot_types:
        slot_type_data = slot_type_template.copy()
        slot_type_data["slotTypeName"] = slot_type_name

        output_path = os.path.join(slot_type_dir, f"{slot_type_name}.json")
        with open(output_path, "w", encoding="utf-8") as outfile:
            json.dump(slot_type_data, outfile, indent=4, ensure_ascii=False)
        print(f"Generated: {output_path}")
    print(f"Generated {len(slot_types)} slot type files in {slot_type_dir}")


# Parse input arguments
parser = argparse.ArgumentParser(description="Extract helpline code from JSON and store input parameter.")
parser.add_argument("--hl", required=True, help="Input parameter hl")
args = parser.parse_args()

# Store input parameter in a variable
hl = args.hl
# Load the JSON file
with open("bot_definition.json", "r", encoding="utf-8") as file:
    bot_definition = json.load(file)

# Extract the first key as bot_name
bot_name = next(iter(bot_definition))

# Example usage
generate_intent_files("bot_definition.json", "templates/intent.json", hl+"/"+bot_name)
# Example usage
generate_slot_files("bot_definition.json", "templates/slot.json", hl+"/"+bot_name)

generate_slot_type_files("bot_definition.json", "templates/slot_type.json", hl+"/"+bot_name)