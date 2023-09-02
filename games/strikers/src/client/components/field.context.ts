import { FieldHex } from '@strikers/lib/field-hex';
import { assign } from '@xstate/immer';
import type { Grid, Hex, HexCoordinates } from 'honeycomb-grid';
import { createContext } from 'react';
import { Interpreter, InterpreterFrom, createMachine } from 'xstate';

type FieldEvent = {
  type: 'SELECT_TILE';
  position: HexCoordinates;
};

type FieldContext = {
  selectedPositions: HexCoordinates[];
};

export const fieldMachine = createMachine({
  id: 'FieldMachine',
  schema: {
    events: {} as FieldEvent,
    context: {} as FieldContext,
  },
  on: {
    SELECT_TILE: {
      actions: assign((context, event) => {
        context.selectedPositions = [event.position];
      }),
    },
  },
});

export const FieldContext = createContext(
  {} as {
    grid: Grid<FieldHex>;
    actor: Interpreter<FieldContext, any, FieldEvent>;
  }
);
