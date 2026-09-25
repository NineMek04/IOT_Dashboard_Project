import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StitchAiService, AiDiagnosisResponse } from '../../services/stitch-ai.service';
import { MachineService, Machine } from '../../services/machine.service';
import { MachineSimulationService } from '../../services/machine-simulation.service';

export interface DiagnosticData {
  confidence: string;
  rootCause: string;
  impactPrediction: string;
  prescriptiveAction: string;
  recommendation?: string;
  lastEvaluated: string;
}

export interface MachineOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-stitch-ai-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stitch-ai-center.component.html'
})
export class StitchAiCenterComponent implements OnInit, OnDestroy {
  private stitchAiService = inject(StitchAiService);
  private machineService = inject(MachineService);
  private simulationService = inject(MachineSimulationService);
  private http = inject(HttpClient);

  // ล้างค่า Default ออก และเตรียมรอรับข้อมูลจริง
  activeMachineId = signal<string>('');
  selectedMachine = signal<string>('กำลังโหลดข้อมูล...');
  machineList = signal<MachineOption[]>([]);
  showMachineDropdown = signal<boolean>(false);

  isSimulationRunning = signal<boolean>(false);
  isSendingCommand = signal<boolean>(false);

  quickActions = [
    {
      id: 'tension',
      label: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">bolt</span>Wire Tension & Clamp Integrity Audit',
      query: 'Check capillary clamp tension variance and vibration damping profile during 138kHz bonding pulses.'
    },
    {
      id: 'resonance',
      label: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">science</span>Ultrasonic Transducer Resonance Scan',
      query: 'Analyze piezo-electric resonance frequency drift and power dissipation on transducer assembly.'
    },
    {
      id: 'thermal',
      label: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">thermometer</span>Capillary Thermal Dissipation Check',
      query: 'Perform infrared thermography scan across bonding tip and evaluate micro-fracture thermal hotspots.'
    }
  ];

  selectedActionId = signal<string>('tension');
  manualQuery = signal<string>('Analyze capillary clamp micro-vibrations...');

  isDiagnosing = signal<boolean>(false);
  actionFeedback = signal<{ type: 'approve' | 'override' | 'stop' | 'run' | null; message: string }>({
    type: null,
    message: ''
  });

  // 💡 1. ดึงค่า State จาก Service แทนการใช้ Signal ว่างๆ
  diagnostic = this.stitchAiService.savedDiagnostic;

  ngOnInit(): void {
    this.loadMachines();
  }

  ngOnDestroy(): void {
    this.simulationService.stopSimulation();
  }

  loadMachines(): void {
    this.machineService.getAllMachines().subscribe({
      next: (machines: Machine[]) => {
        if (machines && machines.length > 0) {
          const list: MachineOption[] = machines.map((m) => ({
            id: m.id || (m as any)._id || m.machineName,
            name: m.machineName
          }));
          this.machineList.set(list);

          // 💡 2. เช็คว่าถ้า Service เคยจำ MachineId ไว้ ให้ดึงกลับมาแสดง
          const savedId = this.stitchAiService.savedMachineId();
          if (savedId && list.some(m => m.id === savedId)) {
            const target = list.find(m => m.id === savedId)!;
            this.activeMachineId.set(target.id);
            this.selectedMachine.set(target.name);
          } else if (!list.some((m) => m.id === this.activeMachineId())) {
            this.activeMachineId.set(list[0].id);
            this.selectedMachine.set(list[0].name);
          }
        } else {
          // กรณีที่ฐานข้อมูลว่างเปล่า (ไม่มีเครื่องจักรเลย)
          this.machineList.set([]);
          this.activeMachineId.set('');
          this.selectedMachine.set('ยังไม่มีการเพิ่ม machine เข้าระบบ');
        }
      },
      error: (err) => {
        console.warn('Could not fetch machines', err);
        this.selectedMachine.set('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    });
  }

  toggleSimulation() {
    if (!this.activeMachineId()) {
      this.actionFeedback.set({ type: 'stop', message: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">warning</span> กรุณาเพิ่มเครื่องจักรในหน้า Fleet ก่อนเปิดระบบจำลอง' });
      return;
    }

    if (this.isSimulationRunning()) {
      this.simulationService.stopSimulation();
      this.isSimulationRunning.set(false);
      this.actionFeedback.set({ type: 'stop', message: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">emergency</span> Stopped Dummy Telemetry Simulation.' });
    } else {
      const allMachineIds = this.machineList().map(m => m.id);
      this.simulationService.startSimulation(allMachineIds);
      this.isSimulationRunning.set(true);
      this.actionFeedback.set({ type: 'run', message: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">rocket_launch</span> Started Dummy Telemetry Simulation.' });
    }
  }

  selectQuickAction(action: { id: string; label: string; query: string }) {
    this.selectedActionId.set(action.id);
    this.manualQuery.set(action.query);
  }

  toggleMachineDropdown() {
    this.showMachineDropdown.update((v) => !v);
  }

  chooseMachine(machine: MachineOption) {
    this.activeMachineId.set(machine.id);
    this.selectedMachine.set(machine.name);
    this.showMachineDropdown.set(false);
  }

  runDiagnostics() {
    const machineId = this.activeMachineId();
    const command = this.manualQuery()?.trim() || '';

    // ป้องกันการกดรัน AI ถ้ายังไม่มีเครื่องจักร
    if (!machineId) {
      this.actionFeedback.set({ type: 'stop', message: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">warning</span> ไม่พบเครื่องจักร กรุณาเพิ่มข้อมูลในหน้า Fleet ก่อน' });
      return;
    }
    if (!command) return;

    this.isDiagnosing.set(true);
    this.clearFeedback();

    this.stitchAiService.runDiagnostics(machineId, command).subscribe({
      next: (res: AiDiagnosisResponse) => {
        this.isDiagnosing.set(false);
        const formattedConfidence = this.formatConfidence(res.confidenceScore);

        // 💡 3. บันทึกผลลัพธ์การวินิจฉัยลงใน Service เพื่อจำค่าข้ามหน้าเว็บ
        this.stitchAiService.savedDiagnostic.set({
          confidence: formattedConfidence,
          rootCause: res.rootCause || 'No root cause identified.',
          impactPrediction: res.impactPrediction || 'No impact prediction reported.',
          prescriptiveAction: res.recommendation || 'No prescriptive action recommended.',
          recommendation: res.recommendation,
          lastEvaluated: new Date().toLocaleTimeString()
        });
        this.stitchAiService.savedMachineId.set(machineId);

        this.actionFeedback.set({ type: 'run', message: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">bolt</span> AI Diagnostics completed!' });
      },
      error: (err) => {
        this.isDiagnosing.set(false);
        this.actionFeedback.set({ type: 'stop', message: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">cancel</span> AI Diagnostics error.' });
      }
    });
  }

  private formatConfidence(score: number): string {
    if (score == null || isNaN(score)) return '95.0%';
    if (score <= 1 && score > 0) return `${(score * 100).toFixed(1)}%`;
    return `${Number(score).toFixed(1)}%`;
  }

  private sendHardwareCommand(actionType: string, feedbackType: 'approve' | 'override' | 'stop', successMsg: string) {
    const machineId = this.activeMachineId();

    // ป้องกันการส่งคำสั่ง MQTT ถ้ายังไม่มีเครื่องจักร
    if (!machineId) {
      this.actionFeedback.set({ type: 'stop', message: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">warning</span> ไม่สามารถส่งคำสั่งได้ เนื่องจากไม่มีเครื่องจักรในระบบ' });
      return;
    }

    if (this.isSendingCommand()) return;
    this.isSendingCommand.set(true);

    const apiUrl = `https://localhost:7133/api/Machine/${encodeURIComponent(machineId)}/command`;

    this.http.post(apiUrl, { action: actionType }).subscribe({
      next: () => {
        this.isSendingCommand.set(false);
        this.actionFeedback.set({ type: feedbackType, message: successMsg });
      },
      error: (err) => {
        this.isSendingCommand.set(false);
        console.error('Command failed', err);
        this.actionFeedback.set({ type: 'stop', message: '<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">cancel</span> Failed to send command to hardware.' });
      }
    });
  }

  handleApprove() {
    this.sendHardwareCommand('APPROVE', 'approve', `<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">check_circle</span> Approved! Action dispatched to ${this.selectedMachine()}.`);
  }

  handleOverride() {
    this.sendHardwareCommand('OVERRIDE', 'override', `<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">warning</span> Manual Override! Operator control engaged for ${this.selectedMachine()}.`);
  }

  handleEmergencyStop() {
    this.sendHardwareCommand('EMERGENCY_STOP', 'stop', `<span class="material-symbols-rounded text-[1.2em] align-middle mr-1.5">emergency</span> EMERGENCY STOP ACTIVATED! Kill signal sent to ${this.selectedMachine()}.`);
  }

  clearFeedback() {
    this.actionFeedback.set({ type: null, message: '' });
  }
}