import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MachineService, Machine } from '../../services/machine.service';

interface WorkOrder {
  id: string;
  machineId: string;
  machineName: string;
  description: string;
  priority: 'CRITICAL' | 'MEDIUM' | 'NORMAL';
  status: 'QUEUED' | 'IN PROGRESS' | 'COMPLETED';
  origin: string;
}

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 relative">
      <!-- Header -->
      <div class="flex justify-between items-center pb-6 border-b border-[#1E3835]">
        <div>
          <h1 class="text-3xl font-extrabold text-[#E8F6F5] flex items-center gap-3">
            <span class="material-symbols-rounded text-2xl text-[1.2em] align-middle text-[#4ED9D3]">build</span> Work Orders
          </h1>
          <p class="text-sm text-[#2BA8A2] mt-1 font-mono">AUTOMATED DISPATCH & MAINTENANCE QUEUE</p>
        </div>
        <a routerLink="/stitch-ai-center" class="px-4 py-2 rounded-full text-xs font-bold bg-[#1E3835] hover:bg-[#2BA8A2] hover:text-[#0B1514] text-[#4ED9D3] transition-all flex items-center gap-1">
          <span class="material-symbols-rounded text-[1.2em]">smart_toy</span> Trigger Diagnostics
        </a>
      </div>

      <!-- Orders List -->
      <div class="bg-[#162B29] border border-[#1E3835] rounded-3xl p-6 shadow-[0_4px_24px_rgba(43,168,162,0.15)]">
        
        @if (isLoading()) {
          <div class="text-center py-8 text-[#2BA8A2] animate-pulse font-mono flex flex-col items-center gap-2">
            <span class="material-symbols-rounded text-3xl animate-spin">sync</span>
            Loading Work Orders from MongoDB...
          </div>
        } @else if (workOrders().length === 0) {
          <div class="text-center py-12 text-gray-500 font-medium flex flex-col items-center gap-3">
            <span class="material-symbols-rounded text-5xl opacity-50">inbox</span>
            <p>No machines found. Add a machine in Fleet Overview to generate work orders.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-[#1E3835] text-[#2BA8A2] text-xs uppercase font-mono tracking-wider">
                  <th class="pb-3 px-4">Order ID</th>
                  <th class="pb-3 px-4">Target Machine</th>
                  <th class="pb-3 px-4">Description</th>
                  <th class="pb-3 px-4">Priority</th>
                  <th class="pb-3 px-4">Status</th>
                  <th class="pb-3 px-4">Origin</th>
                  <th class="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1E3835]/50">
                @for (order of workOrders(); track order.id) {
                  <tr class="hover:bg-[#1E3835]/40 transition-colors group">
                    <td class="py-4 px-4 font-mono font-bold" 
                        [ngClass]="{'text-[#EF6C4A]': order.priority === 'CRITICAL', 'text-[#5DADE2]': order.priority === 'MEDIUM', 'text-[#4ED9D3]': order.priority === 'NORMAL'}">
                      {{ order.id }}
                    </td>
                    <td class="py-4 px-4 font-medium text-[#E8F6F5]">{{ order.machineName }}</td>
                    <td class="py-4 px-4 text-[#E8F6F5]/80">{{ order.description }}</td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold"
                            [ngClass]="{'bg-[#EF6C4A]/20 text-[#EF6C4A]': order.priority === 'CRITICAL', 'bg-[#5DADE2]/20 text-[#5DADE2]': order.priority === 'MEDIUM', 'bg-[#4ED9D3]/20 text-[#4ED9D3]': order.priority === 'NORMAL'}">
                        {{ order.priority }}
                      </span>
                    </td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold"
                            [ngClass]="{
                              'bg-[#FFD23F]/20 text-[#FFD23F] border border-[#FFD23F]/30': order.status === 'QUEUED',
                              'bg-[#5DADE2]/20 text-[#5DADE2] border border-[#5DADE2]/30': order.status === 'IN PROGRESS',
                              'bg-[#4ED9D3]/20 text-[#4ED9D3] border border-[#4ED9D3]/30': order.status === 'COMPLETED'
                            }">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-xs text-[#E8F6F5]/50 font-mono">{{ order.origin }}</td>
                    
                    <td class="py-4 px-4 text-right">
                      @if (order.status !== 'COMPLETED') {
                        <button (click)="openSignModal(order)" 
                                class="px-4 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 ml-auto transition-all duration-200 border bg-[#FFD23F]/10 text-[#FFD23F] border-[#FFD23F]/30 hover:bg-[#FFD23F] hover:text-[#0B1514]">
                          <span class="material-symbols-rounded text-[1.2em]">draw</span> Sign-Off
                        </button>
                      } @else {
                        <span class="text-xs font-bold text-[#4ED9D3] flex items-center justify-end gap-1 opacity-70">
                          <span class="material-symbols-rounded text-[1.2em]">verified</span> Closed
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Modal: Maintenance Sign-Off Document -->
      @if (isSignModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div class="bg-[#E8F6F5] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            
            <div class="bg-[#1E3835] px-6 py-4 flex justify-between items-center text-[#E8F6F5]">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <span class="material-symbols-rounded text-[#FFD23F]">verified_user</span> 
                Maintenance Sign-Off
              </h2>
              <button (click)="closeSignModal()" class="text-[#E8F6F5]/60 hover:text-white transition-colors">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>

            <div class="p-6 text-[#162B29] max-h-[85vh] overflow-y-auto">
              <div class="flex justify-between items-end border-b-2 border-[#162B29]/20 pb-4 mb-4">
                <div>
                  <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Document Ref.</div>
                  <div class="text-xl font-mono font-bold text-[#124D4A]">{{ selectedOrder()?.id }}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</div>
                  <div class="text-sm font-medium">{{ currentDate | date:'dd MMM yyyy HH:mm' }}</div>
                </div>
              </div>

              <div class="mb-4">
                <h3 class="text-sm font-bold text-[#124D4A] mb-1">Equipment Details</h3>
                <p class="text-base font-semibold">{{ selectedOrder()?.machineName }}</p>
                <p class="text-xs text-gray-600 mt-1 italic">Issue: {{ selectedOrder()?.description }}</p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-bold text-[#124D4A] mb-2">Resolution Details & Notes</label>
                <textarea 
                  [(ngModel)]="technicianNotes"
                  rows="3" 
                  placeholder="Describe the actions taken to resolve the issue..."
                  class="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#2BA8A2] focus:ring-2 focus:ring-[#2BA8A2]/30 resize-none"></textarea>
              </div>

              <div class="bg-gray-100 rounded-xl p-4 mb-5 text-xs text-gray-600 leading-relaxed border border-gray-200">
                "I hereby certify that the maintenance and inspection for the aforementioned equipment have been completed according to TERAHOP industrial standards. All systems have been restored to operational status."
              </div>

              <!-- 💡 ส่วนลงชื่อ: มีทั้งพิมพ์ชื่อตัวบรรจง และ กล่องเซ็นลายเซ็น -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <!-- 1. Printed Name -->
                <div>
                  <label class="block text-sm font-bold text-[#124D4A] mb-2 flex items-center gap-1">
                    Technician Name <span class="material-symbols-rounded text-[#2BA8A2] text-[1.2em]">badge</span>
                  </label>
                  <input type="text" [(ngModel)]="technicianName" placeholder="Print full name"
                         class="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-[#124D4A] focus:outline-none focus:border-[#2BA8A2] focus:ring-2 focus:ring-[#2BA8A2]/30 transition-all" />
                </div>

                <!-- 2. Signature Pad -->
                <div>
                  <label class="block text-sm font-bold text-[#124D4A] mb-2 flex items-center gap-1">
                    Signature <span class="material-symbols-rounded text-red-500 text-[1.2em]">draw</span>
                  </label>
                  <div (click)="signDocument()" 
                       class="w-full h-[52px] bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center relative cursor-crosshair group hover:border-[#2BA8A2] transition-colors overflow-hidden select-none">
                    @if (isSigned()) {
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/f6/Signature_of_John_Hancock.svg" class="h-16 opacity-80" alt="Signature">
                      <button (click)="clearSignature($event)" title="Clear Signature" class="absolute top-1 right-1 text-gray-400 hover:text-red-500 bg-gray-100/80 rounded-full p-0.5 transition-colors">
                         <span class="material-symbols-rounded text-[14px]">close</span>
                      </button>
                    } @else {
                      <span class="text-gray-400 text-[10px] font-bold uppercase tracking-wider group-hover:text-[#2BA8A2]">Click to Sign</span>
                    }
                  </div>
                </div>
              </div>

              <div class="flex gap-3 mt-4 border-t border-gray-200 pt-6">
                <button (click)="closeSignModal()" 
                        class="flex-1 py-3.5 rounded-xl font-bold text-[#162B29] bg-gray-200 hover:bg-gray-300 transition-colors uppercase tracking-wider text-sm">
                  Cancel
                </button>
                <!-- 💡 อัปเดตเงื่อนไขปุ่ม Submit ให้ต้องกรอกครบทั้ง 3 อย่าง -->
                <button (click)="completeWorkOrder()" 
                        [disabled]="technicianNotes().length < 5 || (technicianName().length < 3 && !isSigned())"
                        class="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#FFD23F] to-[#F5B041] hover:brightness-105 shadow-[0_4px_16px_rgba(255,210,63,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                  <span class="material-symbols-rounded">check_circle</span> Complete
                </button>
              </div>

            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class WorkOrdersComponent implements OnInit {
  private machineService = inject(MachineService);
  private http = inject(HttpClient);

  workOrders = signal<WorkOrder[]>([]);
  isLoading = signal<boolean>(true);

  isSignModalOpen = signal<boolean>(false);
  selectedOrder = signal<WorkOrder | null>(null);

  // 💡 State สำหรับฟอร์ม
  technicianNotes = signal<string>('');
  technicianName = signal<string>('');
  isSigned = signal<boolean>(false); // เช็คว่าเซ็นหรือยัง
  currentDate = new Date();

  ngOnInit(): void {
    this.loadWorkOrders();
  }

  loadWorkOrders(): void {
    this.isLoading.set(true);
    this.machineService.getAllMachines().subscribe({
      next: (machines) => {
        const orders: WorkOrder[] = machines.map((m, index) => {
          let priority: 'CRITICAL' | 'MEDIUM' | 'NORMAL' = 'NORMAL';
          let status: 'QUEUED' | 'IN PROGRESS' | 'COMPLETED' = 'COMPLETED';
          let desc = 'Routine inspection completed';
          let origin = 'System';

          if (m.status === 'Offline' || m.status === 'Error') {
            priority = 'CRITICAL';
            status = 'QUEUED';
            desc = 'System failure detected. Immediate inspection required.';
            origin = 'Stitch AI Center';
          } else if (m.status === 'Maintenance' || m.status === 'Warning') {
            priority = 'MEDIUM';
            status = 'IN PROGRESS';
            desc = 'Scheduled maintenance and calibration.';
            origin = 'Preventative Maint.';
          } else if (m.runTimeHours > 1000) {
            priority = 'MEDIUM';
            status = 'QUEUED';
            desc = 'High runtime hours (>1000). Suggested tool wear check.';
            origin = 'Auto-Dispatch';
          }

          return {
            id: `#WO-${8800 + index}`,
            machineId: m.id || (m as any)._id || '',
            machineName: m.machineName,
            description: desc,
            priority,
            status,
            origin
          };
        });

        orders.sort((a, b) => {
          if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
          if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
          if (a.priority === 'CRITICAL') return -1;
          if (b.priority === 'CRITICAL') return 1;
          return 0;
        });

        this.workOrders.set(orders);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load machines for work orders', err);
        this.isLoading.set(false);
      }
    });
  }

  openSignModal(order: WorkOrder): void {
    this.selectedOrder.set(order);
    this.technicianNotes.set('');
    this.technicianName.set('');
    this.isSigned.set(false); // ล้างลายเซ็น
    this.currentDate = new Date();
    this.isSignModalOpen.set(true);
  }

  closeSignModal(): void {
    this.isSignModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  // 💡 ฟังก์ชันจำลองการเซ็น
  signDocument(): void {
    this.isSigned.set(true);
  }

  // 💡 ฟังก์ชันลบลายเซ็น
  clearSignature(event: Event): void {
    event.stopPropagation(); // ป้องกันไม่ให้คลิกปุ่มลบแล้วไปรัน signDocument ซ้ำ
    this.isSigned.set(false);
  }

  completeWorkOrder(): void {
    const order = this.selectedOrder();
    if (!order || !order.machineId) return;

    const telemetryUrl = `https://localhost:7133/api/Machine/${encodeURIComponent(order.machineId)}/telemetry`;
    const telemetryPayload = {
      status: 'Online',
      runTimeHours: 0,
      cycleCount: 0
    };

    const historyPayload = {
      machineId: order.machineId,
      orderRef: order.id,
      issueDescription: order.description,
      resolutionNotes: this.technicianNotes(),
      technicianName: this.technicianName(),
      hasSignature: this.isSigned(),
      completedAt: new Date().toISOString()
    };

    // 💡 1. วางโค้ดบันทึกประวัติ (History) ตรงนี้ครับ
    this.http.post('https://localhost:7133/api/Maintenance', historyPayload).subscribe({
      next: () => console.log('บันทึกประวัติการซ่อมลง MongoDB สำเร็จ!'),
      error: (err) => console.error('ไม่สามารถบันทึกประวัติได้', err)
    });

    // 💡 2. โค้ดเดิมของคุณเมฆ (อัปเดตสถานะเครื่องเป็น Online)
    this.http.put(telemetryUrl, telemetryPayload).subscribe({
      next: () => {
        this.closeSignModal();
        this.loadWorkOrders();
      },
      error: (err) => {
        console.error('Failed to complete work order', err);
        alert('เกิดข้อผิดพลาดในการยืนยันเอกสาร กรุณาลองใหม่');
      }
    });
  }
}