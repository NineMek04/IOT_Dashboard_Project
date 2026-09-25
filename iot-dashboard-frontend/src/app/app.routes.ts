import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { OverviewDashboardComponent } from './pages/overview-dashboard/overview-dashboard.component';
import { StitchAiCenterComponent } from './pages/stitch-ai-center/stitch-ai-center.component';
import { MachineFleetComponent } from './pages/machine-fleet/machine-fleet.component';
import { WorkOrdersComponent } from './pages/work-orders/work-orders.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'stitch-ai-center',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewDashboardComponent,
        title: 'Overview Dashboard | Stitch AI'
      },
      {
        path: 'stitch-ai-center',
        component: StitchAiCenterComponent,
        title: 'Stitch AI Center | Flip7 Dark'
      },
      {
        path: 'machine-fleet',
        component: MachineFleetComponent,
        title: 'Machine Fleet | Stitch AI'
      },
      {
        path: 'work-orders',
        component: WorkOrdersComponent,
        title: 'Work Orders | Stitch AI'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'stitch-ai-center'
  }
];
