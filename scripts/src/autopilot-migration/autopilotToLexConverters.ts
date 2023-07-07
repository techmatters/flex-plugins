import {
  CollectActionDefinition,
  FieldTypeResource,
  isCollectActionDefinition,
  TaskDefinition,
} from './autopilotReader';

const enum SlotValueSelectionStrategy {
  TopResolution = 'TOP_RESOLUTION',
}

type SlotValue = {
  synonyms: string[];
};

type SlotType = {
  description: string;
  value_selection_strategy: string;
  values: Record<string, SlotValue>;
};

type Statement = {
  content: string;
  content_type: 'PlainText';
};

type Prompt = Statement & {
  max_attempts: number;
};

type Slot = {
  description: string;
  slot_type: string;
  value_elicitation_prompt: Prompt;
};

type Intent = {
  description: string;
  fulfillment_activity: {
    type: 'ReturnIntent';
  };
  conclusion_statement: Statement;
  rejection_statement: Statement;
  slots: Record<string, Slot>;
};

export type LexChatbotConfig = {
  description: string;
  locale: string;
  process_behavior: string;
  child_directed: boolean;
  idle_session_ttl_in_seconds: string;
  abort_statement: Statement;
  clarification_prompt: Prompt;
  slot_types: Record<string, SlotType>;
  intents: Record<string, Intent>;
};

const DEFAULT_SLOT_TYPES = {
  YesNo: {
    description: 'Custom slot for Yes-No kind of questions',
    value_selection_strategy: 'TOP_RESOLUTION',
    values: {
      Yes: {
        synonyms: ['y', 'yes', 'yep', 'yeah', 'yup', 'ya', 'yah'],
      },
      No: {
        synonyms: ['n', 'no', 'nope', 'nah', 'not'],
      },
    },
  },
};

export const fieldTypeToSlotType = ({ fieldValues, friendlyName }: FieldTypeResource): SlotType => {
  const values: SlotType['values'] = {};
  fieldValues.forEach(({ value, synonymOf }) => {
    const key = synonymOf || value;
    values[key] = values[key] || { synonyms: [] };
    if (synonymOf) {
      values[key].synonyms.push(value);
    }
  });

  return {
    description: friendlyName,
    value_selection_strategy: SlotValueSelectionStrategy.TopResolution,
    values,
  };
};

export const fieldTypesToSlotTypes = (
  fieldTypes: FieldTypeResource[],
): Record<string, SlotType> => {
  const slotTypeEntries: [string, SlotType][] = fieldTypes.map((fieldType) => {
    return [fieldType.uniqueName, fieldTypeToSlotType(fieldType)];
  });
  return { ...DEFAULT_SLOT_TYPES, ...Object.fromEntries(slotTypeEntries) };
};

const collectActionToSlots = ({
  collect: { questions },
}: CollectActionDefinition): Record<string, Slot> => {
  const slotEntries: [string, Slot][] = questions.map(({ type, question, name }, priority) => {
    return [
      name,
      {
        priority,
        description: `Imported from question '${name}'`,
        slot_type: type === 'Twilio.YES_NO' ? 'YesNo' : type,
        value_elicitation_prompt: {
          content: question,
          content_type: 'PlainText',
          max_attempts: 3,
        },
      },
    ];
  });
  return Object.fromEntries(slotEntries);
};

export const tasksToIntents = (tasks: TaskDefinition[]): Record<string, Intent> => {
  const allIntentEntries = tasks.flatMap(({ actions, uniqueName, friendlyName }) => {
    const collectActions: CollectActionDefinition[] = actions.filter((action) =>
      isCollectActionDefinition(action),
    );
    return collectActions.map((action) => {
      return [
        uniqueName,
        {
          slots: collectActionToSlots(action),
          description: `${friendlyName ?? uniqueName} intent`,
          fulfillment_activity: { type: 'ReturnIntent' },
          conclusion_statement: { content: 'Success', content_type: 'PlainText' },
          rejection_statement: { content: 'Failure', content_type: 'PlainText' },
        },
      ];
    });
  });
  return Object.fromEntries(allIntentEntries);
};
