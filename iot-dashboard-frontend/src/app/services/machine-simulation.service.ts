import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MachineSimulationService {
    private http = inject(HttpClient);
    private simulationSubs: Map<string, Subscription> = new Map();
    private readonly apiUrl = 'http://localhost:7133/api/Machine'; // ปรับพอร์ตให้ตรงกับ .NET 

    // รับค่าได้ทั้ง string (Manual 1 เครื่อง) หรือ string[] (Dynamic หลายเครื่อง)
    startSimulation(target: string | string[]) {
        // แปลงให้เป็น Array เสมอเพื่อให้ลูปจัดการได้ง่าย
        const machineIds = Array.isArray(target) ? target : [target];

        machineIds.forEach(id => {
            // ถ้าเครื่องนี้กำลังจำลองอยู่แล้ว ให้ข้ามไป เพื่อป้องกันการยิงซ้ำซ้อน
            if (this.simulationSubs.has(id)) return;

            console.log(`[SIMULATION] เริ่มจำลองการทำงานเครื่องจักร: ${id}`);

            // สุ่มค่าเริ่มต้นให้แต่ละเครื่องไม่เท่ากัน
            let currentRunTime = Math.floor(Math.random() * 500);
            let currentCycle = Math.floor(Math.random() * 10000);

            const sub = interval(60000).subscribe(() => {
                currentRunTime += Math.floor(Math.random() * 2);
                currentCycle += Math.floor(Math.random() * 50) + 10;

                const newStatus = this.generateRandomStatus(currentCycle);

                const payload = {
                    status: newStatus,
                    runTimeHours: currentRunTime,
                    cycleCount: currentCycle
                };

                this.http.put(`${this.apiUrl}/${id}/telemetry`, payload).subscribe({
                    next: () => console.log(`[TELEMETRY] [${id}] อัปเดต Telemetry: ${newStatus}`),
                    error: (err) => console.error(`[ERROR] [${id}] อัปเดตล้มเหลว`, err)
                });
            });

            // เก็บ Subscription ลง Map
            this.simulationSubs.set(id, sub);
        });
    }

    stopSimulation() {
        this.simulationSubs.forEach(sub => sub.unsubscribe());
        this.simulationSubs.clear();
        console.log('[SIMULATION] หยุดการจำลองเครื่องจักรทั้งหมด');
    }

    private generateRandomStatus(cycleCount: number): string {
        const rand = Math.random();
        if (cycleCount > 10000 && rand < 0.3) return 'Error';
        if (rand < 0.7) return 'Online';
        if (rand < 0.9) return 'Warning';
        return 'Error';
    }
}