import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Machine {
  id?: string;
  _id?: string;
  machineName: string;
  machineType: string;
  status: string;
  runTimeHours: number;
  cycleCount?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  calibrationDriftOffset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:7133/api/Machine';

  getAllMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.baseUrl);
  }

  addMachine(machine: Partial<Machine>): Observable<Machine> {
    return this.http.post<Machine>(this.baseUrl, machine);
  }

  deleteMachine(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
