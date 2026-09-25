import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiDiagnosisRequest {
  machineId: string;
  manualCommand: string;
}

export interface AiDiagnosisResponse {
  rootCause: string;
  impactPrediction: string;
  recommendation: string;
  confidenceScore: number;
}

export interface DiagnosticData {
  confidence: string;
  rootCause: string;
  impactPrediction: string;
  prescriptiveAction: string;
  recommendation?: string;
  lastEvaluated: string;
}

@Injectable({
  providedIn: 'root'
})
export class StitchAiService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:7133/api/StitchAi/diagnose';

  public savedDiagnostic = signal<DiagnosticData | null>(null);
  public savedMachineId = signal<string>('');

  runDiagnostics(machineId: string, command: string): Observable<AiDiagnosisResponse> {
    const payload: AiDiagnosisRequest = {
      machineId,
      manualCommand: command
    };
    return this.http.post<AiDiagnosisResponse>(this.apiUrl, payload);
  }
}
