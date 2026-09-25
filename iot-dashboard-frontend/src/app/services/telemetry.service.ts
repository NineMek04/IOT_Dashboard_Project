import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Telemetry {
  id?: string;
  machineId: string;
  temperature: number;
  vibrationLevel: number;
  currentDraw: number;
  yieldRate: number;
  errorCode: string | null;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:7133/api/Telemetry';

  getTelemetryByMachineId(machineId: string): Observable<Telemetry[]> {
    return this.http.get<Telemetry[]>(`${this.baseUrl}/${machineId}`);
  }
}
