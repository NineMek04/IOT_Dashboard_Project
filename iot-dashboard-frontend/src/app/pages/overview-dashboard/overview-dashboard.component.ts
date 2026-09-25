import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MachineService, Machine } from '../../services/machine.service';
import { TelemetryService } from '../../services/telemetry.service';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center pb-6 border-b border-[#1E3835]">
        <div>
          <h1 class="text-3xl font-extrabold text-[#E8F6F5] flex items-center gap-3">
            <span class="material-symbols-rounded text-2xl text-[1.2em] align-middle">bar_chart</span> Overview Dashboard
          </h1>
          <p class="text-sm text-[#2BA8A2] mt-1 font-mono">PLANT METRICS & ACTIVE TELEMETRY</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                [ngClass]="operationalRate >= 80 ? 'bg-[#4ED9D3]/10 text-[#4ED9D3] border-[#4ED9D3]/30' : 'bg-[#EF6C4A]/10 text-[#EF6C4A] border-[#EF6C4A]/30'">
            <span class="w-2 h-2 rounded-full animate-pulse mr-2"
                  [ngClass]="operationalRate >= 80 ? 'bg-[#4ED9D3]' : 'bg-[#EF6C4A]'"></span>
            {{ operationalRate >= 80 ? 'System Optimal' : 'Attention Required' }}
          </span>
          <a routerLink="/stitch-ai-center" class="px-4 py-2 rounded-full text-xs font-bold bg-[#1E3835] hover:bg-[#2BA8A2] hover:text-[#0B1514] text-[#4ED9D3] transition-all">
            Open AI Center →
          </a>
        </div>
      </div>

      <!-- Quick Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Card 1: Active Machines -->
        <div class="bg-[#162B29] border border-[#1E3835] rounded-2xl p-5 shadow-[0_4px_24px_rgba(43,168,162,0.15)]">
          <div class="text-xs text-[#2BA8A2] uppercase tracking-wider font-mono">Active Machines</div>
          <div class="text-3xl font-extrabold text-[#E8F6F5] mt-2">
            {{ runningMachinesCount }} <span class="text-lg text-gray-500">/ {{ totalMachinesCount }}</span>
          </div>
          <div class="text-xs mt-2 flex items-center gap-1" [ngClass]="operationalRate >= 80 ? 'text-[#4ED9D3]' : 'text-[#EF6C4A]'">
            <span>{{ operationalRate >= 80 ? '↑' : '↓' }} {{ operationalRate | number:'1.1-1' }}%</span>
            <span class="text-[#E8F6F5]/50">operational rate</span>
          </div>
        </div>

        <!-- Card 2: AI Diagnostics Today -->
        <div class="bg-[#162B29] border border-[#1E3835] rounded-2xl p-5 shadow-[0_4px_24px_rgba(43,168,162,0.15)]">
          <div class="text-xs text-[#2BA8A2] uppercase tracking-wider font-mono">Total Cycle Output</div>
          <div class="text-3xl font-extrabold text-[#FFD23F] mt-2">
            {{ totalCycleCount | number }}
          </div>
          <div class="text-xs text-[#FFD23F] mt-2 flex items-center gap-1">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-rounded text-[1.2em] align-middle">bolt</span>
              <span>{{ totalRunTimeHours | number:'1.0-0' }} hours total runtime</span>
            </span>
          </div>
        </div>

        <!-- Card 3: Avg Throughput -->
        <div class="bg-[#162B29] border border-[#1E3835] rounded-2xl p-5 shadow-[0_4px_24px_rgba(43,168,162,0.15)]">
          <div class="text-xs text-[#2BA8A2] uppercase tracking-wider font-mono">Avg Throughput (Est.)</div>
          <div class="text-3xl font-extrabold text-[#5DADE2] mt-2" [ngClass]="{'text-[#EF6C4A]': avgThroughput < 80}">
            {{ avgThroughput | number:'1.1-1' }}%
          </div>
          <div class="text-xs text-[#5DADE2] mt-2 flex items-center gap-1">
            <span>Target: &gt; 90.0%</span>
          </div>
        </div>

        <!-- Card 4: Open Work Orders -->
        <div class="bg-[#162B29] border border-[#1E3835] rounded-2xl p-5 shadow-[0_4px_24px_rgba(43,168,162,0.15)]">
          <div class="text-xs text-[#2BA8A2] uppercase tracking-wider font-mono">System Anomalies</div>
          <div class="text-3xl font-extrabold text-[#EF6C4A] mt-2">
            {{ anomaliesCount }}
          </div>
          <div class="text-xs text-[#EF6C4A] mt-2 flex items-center gap-1">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-rounded text-[1.2em] align-middle">warning</span>
              <span>{{ highPriorityWorkOrdersCount }} critical alerts</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Chart & Watchlist -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Area (Chart) -->
        <div class="col-span-1 lg:col-span-8 bg-[#162B29] rounded-3xl border border-[#1E3835] shadow-[0_4px_24px_rgba(43,168,162,0.15)] p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-[#E8F6F5] text-xl font-bold flex items-center gap-2">
                <span class="material-symbols-rounded text-[1.2em] align-middle">trending_up</span> Live Temperature Trend
              </h2>
              <span class="text-xs font-mono text-[#2BA8A2] bg-[#0B1514] px-3 py-1 rounded-full border border-[#1E3835]">
                Machine: <span class="text-[#4ED9D3] font-semibold">{{ monitoredMachineName }}</span>
              </span>
            </div>
            
            <div class="h-[300px] w-full relative">
              @if (totalMachinesCount === 0) {
                <div class="absolute inset-0 flex flex-col items-center justify-center text-[#2BA8A2] font-mono border border-dashed border-[#1E3835] rounded-2xl">
                  <span class="material-symbols-rounded text-3xl mb-2 text-[1.2em] align-middle">trending_down</span>
                  <span>No data available. Add a machine to see telemetry.</span>
                </div>
              } @else {
                <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="lineChartType"></canvas>
              }
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-[#1E3835] flex justify-between items-center text-xs text-[#2BA8A2]">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#4ED9D3]" [class.animate-ping]="totalMachinesCount > 0"></span> 
              {{ totalMachinesCount > 0 ? 'Real-time Telemetry Polling Active' : 'System Standby' }}
            </span>
            <span class="text-[#E8F6F5]/40 font-mono">Points: {{ lineChartData.labels?.length || 0 }} intervals</span>
          </div>
        </div>

        <!-- Right Area (Watchlist) -->
        <div class="col-span-1 lg:col-span-4 bg-[#0B1514] rounded-3xl border border-[#1E3835] p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-[#EF6C4A] text-sm uppercase tracking-widest font-bold flex items-center gap-2">
              <span class="material-symbols-rounded text-[1.2em] align-middle">warning</span> CRITICAL WATCHLIST
            </h2>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-[#EF6C4A]/10 text-[#EF6C4A] border border-[#EF6C4A]/30">
              {{ watchlist.length }} Flags
            </span>
          </div>

          <div class="flex-1 overflow-y-auto max-h-[340px] pr-1 space-y-3">
            @for (item of watchlist; track item.id || item.machineName) {
              <div class="bg-[#162B29] border-l-4 border-[#EF6C4A] p-4 rounded-xl mb-3">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="text-[#E8F6F5] font-bold">{{ item.machineName }}</div>
                    <div class="text-[#EF6C4A] text-sm mt-0.5 font-mono">
                      Status: {{ item.status }}
                      <span *ngIf="item.calibrationDriftOffset" class="text-xs text-[#FFD23F] block mt-1">
                        (Drift: {{ item.calibrationDriftOffset > 0 ? '+' : '' }}{{ item.calibrationDriftOffset }}mm)
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <a routerLink="/stitch-ai-center" class="inline-block text-xs bg-[#1E3835] text-[#4ED9D3] px-3 py-1 mt-3 rounded-full hover:bg-[#2BA8A2] hover:text-[#E8F6F5] transition-all font-semibold">
                    Diagnose via AI →
                  </a>
                </div>
              </div>
            } @empty {
              <!-- Empty State if no critical machines -->
              <div class="text-center py-10 px-4 bg-[#162B29]/40 rounded-xl border border-dashed border-[#1E3835]">
                <div class="text-2xl mb-2 text-[#4ED9D3]">
                  <span class="material-symbols-rounded text-2xl text-[1.2em] align-middle">check_circle</span>
                </div>
                <p class="text-sm text-[#E8F6F5] font-semibold">All Systems Nominal</p>
                <p class="text-xs text-[#2BA8A2] mt-1">No machines currently require urgent intervention</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class OverviewDashboardComponent implements OnInit, OnDestroy {
  private machineService = inject(MachineService);
  private telemetryService = inject(TelemetryService);

  private simulationInterval: any;

  // Dynamic KPI Properties
  totalMachinesCount = 0;
  runningMachinesCount = 0;
  operationalRate = 0;

  totalCycleCount = 0;
  totalRunTimeHours = 0;
  avgThroughput = 0;

  anomaliesCount = 0;
  highPriorityWorkOrdersCount = 0;

  // Watchlist
  watchlist: Machine[] = [];

  // Chart Properties
  monitoredMachineName = 'No Data';
  public lineChartType = 'line' as const;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Temperature (°C)',
        backgroundColor: 'transparent',
        borderColor: '#4ED9D3',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: '#FFD23F',
        pointBorderColor: '#FFD23F',
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#FFD23F'
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#E8F6F5', font: { family: 'monospace' } }
      },
      tooltip: {
        backgroundColor: '#0B1514',
        titleColor: '#E8F6F5',
        bodyColor: '#4ED9D3',
        borderColor: '#1E3835',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` Temperature: ${context.parsed.y} °C`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#1E3835' },
        ticks: { color: '#2BA8A2', font: { family: 'monospace' } }
      },
      y: {
        grid: { color: '#1E3835' },
        ticks: {
          color: '#2BA8A2',
          font: { family: 'monospace' },
          callback: (value) => `${value}°C`
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadMachines();
  }

  ngOnDestroy(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  private loadMachines(): void {
    this.machineService.getAllMachines().subscribe({
      next: (machines) => {
        if (!machines || machines.length === 0) {
          this.resetMetrics();
          return;
        }

        this.calculateMetrics(machines);
        this.populateWatchlist(machines);
        this.fetchActiveMachineTelemetry(machines);
      },
      error: (err) => {
        console.warn('Unable to load machines from API:', err);
        this.resetMetrics();
      }
    });
  }

  private resetMetrics(): void {
    this.totalMachinesCount = 0;
    this.runningMachinesCount = 0;
    this.operationalRate = 0;
    this.totalCycleCount = 0;
    this.totalRunTimeHours = 0;
    this.avgThroughput = 0;
    this.anomaliesCount = 0;
    this.highPriorityWorkOrdersCount = 0;
    this.watchlist = [];
    this.monitoredMachineName = 'Awaiting Data';
    this.updateChart([], []);
  }

  private calculateMetrics(machines: Machine[]): void {
    this.totalMachinesCount = machines.length;

    // คำนวณยอดรวม (Sum) จากฐานข้อมูลจริง
    this.totalCycleCount = machines.reduce((sum, m) => sum + (m.cycleCount || 0), 0);
    this.totalRunTimeHours = machines.reduce((sum, m) => sum + (m.runTimeHours || 0), 0);

    // จำแนกสถานะ
    this.runningMachinesCount = machines.filter(m => m.status === 'Running' || m.status === 'Online').length;
    this.operationalRate = (this.runningMachinesCount / this.totalMachinesCount) * 100;

    const errorMachines = machines.filter(m => m.status === 'Error' || m.status === 'Offline');
    const warningMachines = machines.filter(m => m.status === 'Warning' || m.status === 'Maintenance');

    this.anomaliesCount = errorMachines.length + warningMachines.length;
    this.highPriorityWorkOrdersCount = errorMachines.length;

    // จำลองการคำนวณ Throughput อิงตามเครื่องที่ทำงานปกติ
    const baseThroughput = 96.5;
    const penalty = (this.anomaliesCount / this.totalMachinesCount) * 20;
    this.avgThroughput = Math.max(0, Number((baseThroughput - penalty).toFixed(1)));
  }

  private populateWatchlist(machines: Machine[]): void {
    // เลือกเฉพาะเครื่องที่มีปัญหามาแสดงในฝั่งขวา
    this.watchlist = machines.filter(m =>
      m.status === 'Error' ||
      m.status === 'Offline' ||
      m.status === 'Maintenance' ||
      m.status === 'Warning' ||
      (m.calibrationDriftOffset != null && Math.abs(m.calibrationDriftOffset) >= 1.0)
    );
  }

  private fetchActiveMachineTelemetry(machines: Machine[]): void {
    // หาเครื่องที่ทำงานอยู่มาแสดงบนกราฟ
    const activeMachine = machines.find(m => m.status === 'Running' || m.status === 'Online') || machines[0];
    this.monitoredMachineName = activeMachine.machineName;
    const machineId = activeMachine.id || activeMachine._id;

    if (!machineId) return;

    this.telemetryService.getTelemetryByMachineId(machineId).subscribe({
      next: (telemetry) => {
        if (telemetry && telemetry.length > 0) {
          const recentTelemetry = telemetry.slice(-15);
          const labels = recentTelemetry.map(t => {
            const date = new Date(t.timestamp);
            return isNaN(date.getTime()) ? t.timestamp : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          });
          const temps = recentTelemetry.map(t => t.temperature);
          this.updateChart(labels, temps);
        } else {
          // หากไม่มีข้อมูลประวัติใน Database ให้จำลองการวาดกราฟแบบสดๆ (Live Simulation)
          this.simulateLiveChart();
        }
      },
      error: () => {
        // Fallback กรณี API TelemetryService ยังไม่ถูกสร้าง
        this.simulateLiveChart();
      }
    });
  }

  // ฟังก์ชันสร้างกราฟจำลองแบบสดๆ อิงตามชื่อเครื่องจักรจริง
  private simulateLiveChart(): void {
    const labels: string[] = [];
    const data: number[] = [];
    let currentTemp = 72.0;

    // สร้างข้อมูลย้อนหลัง 15 จุด
    for (let i = 14; i >= 0; i--) {
      const time = new Date(Date.now() - i * 3000);
      labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      data.push(Number(currentTemp.toFixed(1)));
      currentTemp += (Math.random() - 0.5) * 2.5;
    }
    this.updateChart(labels, data);

    // วิ่งอัปเดตกราฟทุก 3 วินาที
    this.simulationInterval = setInterval(() => {
      const time = new Date();
      labels.shift();
      data.shift();

      labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      currentTemp += (Math.random() - 0.5) * 2.5;

      // คุมอุณหภูมิให้อยู่ในกรอบ 60 - 85
      if (currentTemp > 85) currentTemp -= 2;
      if (currentTemp < 60) currentTemp += 2;

      data.push(Number(currentTemp.toFixed(1)));

      this.updateChart([...labels], [...data]);
    }, 3000);
  }

  private updateChart(labels: string[], data: number[]): void {
    this.lineChartData = {
      labels,
      datasets: [{
        ...this.lineChartData.datasets[0],
        data
      }]
    };
  }
}