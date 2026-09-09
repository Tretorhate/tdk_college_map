import type { Building } from './types.ts';
import { mainPlans } from './main.ts';
import { itPlans } from './it.ts';
import { industrialPlans } from './industrial.ts';

export const buildings: Building[] = [
  {
    id: 'main',
    name: { kk: 'Бас корпус', ru: 'Главный корпус' },
    plans: mainPlans,
  },
  {
    id: 'it',
    name: { kk: 'IT корпусы', ru: 'IT-корпус' },
    plans: itPlans,
  },
  {
    id: 'industrial',
    name: { kk: 'Өндірістік корпус', ru: 'Производственный корпус' },
    plans: industrialPlans,
  },
];
