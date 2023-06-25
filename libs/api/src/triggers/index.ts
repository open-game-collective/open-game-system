import { TriggerConfig } from '@explorers-club/schema';

const NewRoomTriggerConfig = {
  id: 'NewRoomTrigger',
  event: {
    type: 'JOIN',
    // filters: [
    //   ['']
    // ]
  },
  entity: {
    schema: 'room',
    // filters: [['/slug', 'eq', '1234']],
  },
  workflowConfigId: 'OnboardingWorkflow',
  // inputs: {

  // }
} satisfies TriggerConfig;

// const OnboardingWorkflow

// const trigger = {
//   event: {
//     event_type: '',
//   },
// };

// import { Trigger } from "deno-slack-api/types.ts";
// import { TriggerEventTypes, TriggerTypes, TriggerContextData } from "deno-slack-api/mod.ts";

// const trigger: Trigger<typeof ExampleWorkflow.definition> = {
//   type: TriggerTypes.Event,
//   name: "Reactji response",
//   description: "responds to a specific reactji",
//   workflow: "#/workflows/myWorkflow",
//   event: {
//     event_type: TriggerEventTypes.ReactionAdded,
//     channel_ids: ["C123ABC456"],
//     filter: {
//       version: 1,
//       root: {
//         statement: "{{data.reaction}} == sunglasses"
//       }
//     }
//   },
//   inputs: {
//     stringtoSend: {
//       value: "how cool is that",
//     },
//     channel: {
//       value: "C123ABC456",
//     },
//   },
// };

// export default trigger;
