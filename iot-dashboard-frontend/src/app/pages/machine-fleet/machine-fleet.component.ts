import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // 💡 นำเข้า HttpClient สำหรับยิง API ดึงประวัติ
import { MachineService, Machine } from '../../services/machine.service';
import { ModalComponent } from '../../layouts/templates/modal/modal.component';

@Component({
  selector: 'app-machine-fleet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <!-- Header & Add Button -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#1E3835]">
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-[#E8F6F5] tracking-tight flex items-center gap-3">
            <span class="material-symbols-rounded text-[1.2em] align-middle text-2xl md:text-3xl text-[#4ED9D3]">factory</span>
            <span>Machine Fleet Overview</span>
          </h1>
        </div>

        <button type="button" (click)="openAddModal()"
          class="rounded-full text-[#124D4A] font-extrabold bg-gradient-to-r from-[#4ED9D3] to-[#2BA8A2] shadow-[0_0_24px_rgba(43,168,162,0.5)] px-6 py-3 hover:scale-105 transition-transform duration-200 cursor-pointer select-none flex items-center gap-2 text-sm md:text-base uppercase tracking-wider">
          <span class="material-symbols-rounded text-[1.2em]">add</span>
          <span>Add Machine</span>
        </button>
      </header>

      <!-- Feedback Toast Banner -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-2xl bg-[#2BA8A2]/15 border border-[#2BA8A2] text-[#4ED9D3] shadow-[0_0_24px_rgba(43,168,162,0.3)] flex items-center justify-between text-sm transition-all">
          <div class="flex items-center gap-2 font-medium">
            <span class="flex items-center gap-2" [innerHTML]="feedbackMessage()"></span>
          </div>
          <button (click)="feedbackMessage.set('')" class="text-xs uppercase font-mono tracking-wider opacity-70 hover:opacity-100 px-2 py-1 rounded">
            <span class="material-symbols-rounded text-[1.2em]">close</span>
          </button>
        </div>
      }

      <!-- Error Banner -->
      @if (errorMessage()) {
        <div class="p-4 rounded-2xl bg-[#EF6C4A]/15 border border-[#EF6C4A] text-[#EF6C4A] shadow-[0_0_24px_rgba(239,108,74,0.4)] flex items-center justify-between text-sm transition-all">
          <div class="flex items-center gap-2 font-medium">
            <span class="material-symbols-rounded text-[1.2em] align-middle">warning</span>
            <span>{{ errorMessage() }}</span>
          </div>
          <button (click)="errorMessage.set('')" class="text-xs uppercase font-mono tracking-wider opacity-70 hover:opacity-100 px-2 py-1 rounded">
            <span class="material-symbols-rounded text-[1.2em]">close</span>
          </button>
        </div>
      }

      <!-- เช็ค State ตอนกำลังโหลดข้อมูล -->
      @if (isLoading()) {
        <div class="flex flex-col justify-center items-center py-20 text-[#2BA8A2] font-mono animate-pulse gap-2">
          <span class="material-symbols-rounded text-4xl animate-spin">sync</span>
          กำลังโหลดข้อมูลเครื่องจักร...
        </div>
      } @else {
        <!-- Machine Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (machine of machines(); track getMachineId(machine)) {
            <div class="bg-[#162B29] rounded-2xl border border-[#1E3835] shadow-[0_4px_24px_rgba(43,168,162,0.15)] p-6 flex flex-col justify-between hover:border-[#2BA8A2]/50 transition-all duration-200">
              <div>
                <div class="flex justify-between items-center gap-2">
                  <h3 class="text-lg font-bold text-[#E8F6F5] tracking-wide truncate">{{ machine.machineName }}</h3>
                  <span class="rounded-full px-3 py-1 text-xs font-bold shrink-0 inline-flex items-center gap-1.5"
                    [ngClass]="{
                      'bg-[#4ED9D3]/20 text-[#4ED9D3] border border-[#4ED9D3]/30': machine.status === 'Running' || machine.status === 'Online',
                      'bg-[#EF6C4A]/20 text-[#EF6C4A] border border-[#EF6C4A]/30': machine.status === 'Maintenance',
                      'bg-[#FFD23F]/20 text-[#FFD23F] border border-[#FFD23F]/30': machine.status === 'Idle' || machine.status === 'Warning',
                      'bg-[#1E3835] text-[#E8F6F5]/70': machine.status === 'Offline' || machine.status === 'Error'
                    }">
                    <span class="w-1.5 h-1.5 rounded-full"
                      [ngClass]="{
                        'bg-[#4ED9D3] animate-pulse': machine.status === 'Running' || machine.status === 'Online',
                        'bg-[#EF6C4A]': machine.status === 'Maintenance',
                        'bg-[#FFD23F]': machine.status === 'Idle' || machine.status === 'Warning',
                        'bg-gray-400': machine.status === 'Offline' || machine.status === 'Error'
                      }"></span>
                    <span>{{ machine.status }}</span>
                  </span>
                </div>

                <div class="text-sm text-gray-400 mt-2 space-y-2 pt-2">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-[#2BA8A2] font-mono uppercase tracking-wider">Type:</span>
                    <span class="text-[#E8F6F5] font-medium text-right truncate max-w-[60%]">{{ machine.machineType }}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-[#2BA8A2] font-mono uppercase tracking-wider">Run Hours:</span>
                    <span class="text-[#E8F6F5] font-mono font-medium">{{ machine.runTimeHours }} hrs</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-[#2BA8A2] font-mono uppercase tracking-wider">Next Maintenance:</span>
                    <span class="text-[#FFD23F] font-mono">{{ formatMaintenanceDate(machine.nextMaintenanceDate) }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons Container -->
              <div class="flex justify-between items-center mt-4 border-t border-[#1E3835] pt-4">
                <span class="text-[10px] text-gray-500 font-mono truncate max-w-[140px]" [title]="getMachineId(machine)">
                  ID: {{ getMachineId(machine).slice(-8) }}
                </span>
                
                <div class="flex gap-2">
                  <!-- 💡 ปุ่ม History -->
                  <button type="button" (click)="openHistoryModal(machine)"
                    class="rounded-full px-3 py-1.5 text-xs font-bold bg-[#1E3835] text-[#4ED9D3] hover:bg-[#2BA8A2] hover:text-[#0B1514] transition-all duration-200 cursor-pointer flex items-center gap-1">
                    <span class="material-symbols-rounded text-[1.2em]">history</span>
                    <span>History</span>
                  </button>

                  <!-- ปุ่ม Delete -->
                  <button type="button" (click)="deleteMachine(getMachineId(machine))"
                    class="rounded-full px-3 py-1.5 text-xs font-bold bg-[#1A1A1A] text-[#EF6C4A] hover:bg-[#EF6C4A] hover:text-white hover:shadow-[0_0_16px_rgba(239,108,74,0.6)] transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-[1.2em]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-1 md:col-span-2 lg:col-span-3 bg-[#162B29] border border-[#1E3835] rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center">
              <div class="text-[#4ED9D3]/70 mb-3">
                <span class="material-symbols-rounded text-[4em] align-middle opacity-50">factory</span>
              </div>
              <p class="text-base text-[#E8F6F5] font-semibold">No machines found in database.</p>
              <p class="text-xs text-[#2BA8A2] mt-1">Click "+ Add Machine" above to POST a new machine to MongoDB.</p>
            </div>
          }
        </div>
      }

      <!-- Add Machine Modal -->
      <app-modal [title]="'Add New Machine'" [isOpen]="isAddModalOpen()" (closeModal)="closeAddModal()">
        <form [formGroup]="machineForm" (ngSubmit)="addNewMachine()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase tracking-wider text-[#2BA8A2] font-bold">Machine Name</label>
              <input type="text" formControlName="machineName" placeholder="e.g. Wire Bonder 01" class="bg-[#1E3835] border border-[#1E3835] text-[#E8F6F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/40 transition-all placeholder:text-[#E8F6F5]/40" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase tracking-wider text-[#2BA8A2] font-bold">Machine Type</label>
              <input type="text" formControlName="machineType" placeholder="e.g. High-Speed Ultrasonic Bonder" class="bg-[#1E3835] border border-[#1E3835] text-[#E8F6F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/40 transition-all placeholder:text-[#E8F6F5]/40" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase tracking-wider text-[#2BA8A2] font-bold">Status</label>
              <select formControlName="status" class="bg-[#1E3835] border border-[#1E3835] text-[#E8F6F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/40 transition-all">
                <option value="Online" class="bg-[#162B29] text-[#E8F6F5]">Online / Running</option>
                <option value="Idle" class="bg-[#162B29] text-[#E8F6F5]">Idle</option>
                <option value="Maintenance" class="bg-[#162B29] text-[#E8F6F5]">Maintenance</option>
                <option value="Error" class="bg-[#162B29] text-[#E8F6F5]">Error / Offline</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase tracking-wider text-[#2BA8A2] font-bold">Run Time Hours</label>
              <input type="number" step="0.1" min="0" formControlName="runTimeHours" placeholder="0" class="bg-[#1E3835] border border-[#1E3835] text-[#E8F6F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/40 transition-all" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase tracking-wider text-[#2BA8A2] font-bold">Cycle Count</label>
              <input type="number" min="0" formControlName="cycleCount" placeholder="0" class="bg-[#1E3835] border border-[#1E3835] text-[#E8F6F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/40 transition-all" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase tracking-wider text-[#2BA8A2] font-bold">Calibration Drift Offset</label>
              <input type="number" step="0.001" formControlName="calibrationDriftOffset" placeholder="0" class="bg-[#1E3835] border border-[#1E3835] text-[#E8F6F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/40 transition-all" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase tracking-wider text-[#2BA8A2] font-bold">Last Maintenance Date</label>
              <input type="date" formControlName="lastMaintenanceDate" class="bg-[#1E3835] border border-[#1E3835] text-[#E8F6F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/40 transition-all" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase tracking-wider text-[#2BA8A2] font-bold">Next Maintenance Date</label>
              <input type="date" formControlName="nextMaintenanceDate" class="bg-[#1E3835] border border-[#1E3835] text-[#E8F6F5] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/40 transition-all" />
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8 pt-4 border-t border-[#1E3835]">
            <button type="button" (click)="closeAddModal()"
              class="px-6 py-3 rounded-full bg-[#1A1A1A] text-[#E8F6F5] font-bold hover:bg-[#1E3835] transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" [disabled]="machineForm.invalid || isLoading()"
              class="px-6 py-3 rounded-full bg-[#2BA8A2] text-[#E8F6F5] font-bold shadow-[0_0_24px_rgba(43,168,162,0.5)] hover:bg-[#4ED9D3] disabled:opacity-50 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2">
              <span class="material-symbols-rounded text-[1.2em]">save</span> Save Machine
            </button>
          </div>
        </form>
      </app-modal>

      <!-- 💡 History Modal -->
      <app-modal [title]="'Maintenance Log'" [isOpen]="isHistoryModalOpen()" (closeModal)="closeHistoryModal()">
        <div class="text-[#E8F6F5]">
          <h3 class="text-lg font-bold text-[#4ED9D3] mb-4 flex items-center gap-2">
            <span class="material-symbols-rounded">precision_manufacturing</span> 
            {{ selectedHistoryMachineName() }}
          </h3>
          
          <div class="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            @if (isLoadingHistory()) {
              <div class="text-center py-10 text-[#2BA8A2] animate-pulse flex flex-col items-center gap-2">
                <span class="material-symbols-rounded text-4xl animate-spin">sync</span>
                Loading History Records...
              </div>
            } @else if (machineHistory().length === 0) {
              <div class="text-center py-10 text-gray-500 font-medium border border-dashed border-[#1E3835] rounded-xl flex flex-col items-center">
                <span class="material-symbols-rounded text-5xl mb-2 opacity-50">history_toggle_off</span>
                <p>No maintenance history found for this machine.</p>
                <p class="text-xs text-[#2BA8A2] mt-1">Maintenance logs will appear here after sign-off.</p>
              </div>
            } @else {
              <!-- Timeline UI -->
              <div class="relative border-l-2 border-[#2BA8A2]/30 ml-4 space-y-6 pb-4">
                @for (record of machineHistory(); track record.id) {
                  <div class="relative pl-6">
                    <span class="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#1E3835] border-2 border-[#4ED9D3] shadow-[0_0_8px_rgba(78,217,211,0.6)]"></span>
                    
                    <div class="bg-[#162B29] border border-[#1E3835] rounded-xl p-4 hover:border-[#2BA8A2]/50 transition-colors shadow-sm">
                      <div class="flex justify-between items-start mb-3 border-b border-[#1E3835] pb-2">
                        <div>
                          <span class="text-[10px] uppercase tracking-widest text-[#FFD23F] font-bold bg-[#FFD23F]/10 px-2 py-0.5 rounded border border-[#FFD23F]/20">
                            {{ record.orderRef || 'MANUAL-LOG' }}
                          </span>
                        </div>
                        <div class="text-xs text-[#2BA8A2] font-mono font-semibold flex items-center gap-1">
                          <span class="material-symbols-rounded text-[1.2em]">calendar_today</span>
                          {{ record.completedAt | date:'dd MMM yyyy HH:mm' }}
                        </div>
                      </div>
                      
                      <div class="space-y-3 mt-3">
                        <div>
                          <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Diagnosed Issue</p>
                          <p class="text-sm text-[#E8F6F5] leading-relaxed">{{ record.issueDescription }}</p>
                        </div>
                        <div class="bg-[#1E3835]/40 p-3 rounded-lg border border-[#1E3835]">
                          <p class="text-[10px] text-[#4ED9D3] uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                            <span class="material-symbols-rounded text-[1.2em]">build_circle</span> Resolution
                          </p>
                          <p class="text-sm text-[#E8F6F5] leading-relaxed">{{ record.resolutionNotes }}</p>
                        </div>
                      </div>
                      
                      <div class="mt-4 pt-3 border-t border-[#1E3835] flex items-center justify-between text-xs">
                        <div class="flex items-center gap-1.5 text-gray-400">
                          <span class="material-symbols-rounded text-[1.2em]">badge</span>
                          Technician: <span class="text-[#E8F6F5] font-semibold">{{ record.technicianName || 'Unknown' }}</span>
                        </div>
                        @if (record.hasSignature) {
                          <div class="flex items-center gap-1 text-[#4ED9D3] font-bold">
                            <span class="material-symbols-rounded text-[1.2em]">draw</span> E-Signed
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </app-modal>

    </div>
  `
})
export class MachineFleetComponent implements OnInit {
  private machineService = inject(MachineService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient); // 💡 Inject HttpClient สำหรับดึงประวัติ

  machines = signal<Machine[]>([]);
  isLoading = signal<boolean>(true);
  feedbackMessage = signal<string>('');
  errorMessage = signal<string>('');
  isAddModalOpen = signal(false);

  // 💡 State สำหรับ History Modal
  isHistoryModalOpen = signal(false);
  selectedHistoryMachineName = signal('');
  machineHistory = signal<any[]>([]);
  isLoadingHistory = signal(false);

  machineForm: FormGroup = this.fb.group({
    machineName: ['', Validators.required],
    machineType: ['', Validators.required],
    status: ['Online', Validators.required],
    runTimeHours: [0, [Validators.required, Validators.min(0)]],
    cycleCount: [0, [Validators.required, Validators.min(0)]],
    lastMaintenanceDate: ['', Validators.required],
    nextMaintenanceDate: ['', Validators.required],
    calibrationDriftOffset: [0, Validators.required]
  });

  ngOnInit(): void {
    this.loadMachines();
  }

  openAddModal(): void {
    this.machineForm.reset({
      machineName: '',
      machineType: '',
      status: 'Online',
      runTimeHours: 0,
      cycleCount: 0,
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      calibrationDriftOffset: 0
    });
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  loadMachines(): void {
    this.isLoading.set(true);
    this.machineService.getAllMachines().subscribe({
      next: (data) => {
        this.machines.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch machines from backend API', err);
        this.errorMessage.set(`Could not connect to backend API.`);
        this.isLoading.set(false);
      }
    });
  }

  addNewMachine(): void {
    if (this.machineForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.machineForm.value;

    this.machineService.addMachine(formValue).subscribe({
      next: (created) => {
        this.loadMachines();
        this.closeAddModal();
        this.feedbackMessage.set(`<span class="material-symbols-rounded text-[1.2em] align-middle">check_circle</span> Successfully created ${created?.machineName || formValue.machineName}.`);
      },
      error: (err) => {
        console.error('Failed to add machine', err);
        this.errorMessage.set(`POST failed: ${err.message}`);
        this.isLoading.set(false);
      }
    });
  }

  deleteMachine(id: string): void {
    if (!id) return;

    const target = this.machines().find((m) => this.getMachineId(m) === id);
    const targetName = target ? target.machineName : id;

    this.machineService.deleteMachine(id).subscribe({
      next: () => {
        this.machines.update(list => list.filter((m) => this.getMachineId(m) !== id));
        this.feedbackMessage.set(`<span class="material-symbols-rounded text-[1.2em] align-middle">delete</span> Deleted ${targetName} from MongoDB.`);
      },
      error: (err) => {
        console.error('Failed to delete machine', err);
        this.errorMessage.set(`DELETE failed: ${err.message}`);
      }
    });
  }

  getMachineId(machine: Machine): string {
    return machine.id || machine._id || '';
  }

  formatMaintenanceDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // 💡 --- Functions สำหรับ History Modal ---
  openHistoryModal(machine: Machine): void {
    const id = this.getMachineId(machine);
    this.selectedHistoryMachineName.set(machine.machineName);
    this.isHistoryModalOpen.set(true);
    this.loadMachineHistory(id);
  }

  closeHistoryModal(): void {
    this.isHistoryModalOpen.set(false);
    this.machineHistory.set([]); // ล้างข้อมูลทุกครั้งที่ปิดเพื่อไม่ให้ค้างตอนเปิดเครื่องอื่น
  }

  loadMachineHistory(machineId: string): void {
    this.isLoadingHistory.set(true);
    this.http.get<any[]>(`https://localhost:7133/api/Maintenance/machine/${machineId}`).subscribe({
      next: (data) => {
        this.machineHistory.set(data || []);
        this.isLoadingHistory.set(false);
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.machineHistory.set([]);
        this.isLoadingHistory.set(false);
      }
    });
  }
}