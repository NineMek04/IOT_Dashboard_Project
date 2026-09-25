import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-[#162B29] w-full max-w-2xl rounded-3xl border border-[#1E3835] shadow-[0_4px_24px_rgba(43,168,162,0.15)] p-6 md:p-8 flex flex-col max-h-[90vh] overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-[#E8F6F5]">{{ title }}</h2>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="text-gray-400 hover:text-[#EF6C4A] transition-colors p-1.5 rounded-lg cursor-pointer flex items-center justify-center"
            aria-label="Close modal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto pr-2 mt-4 custom-scrollbar">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }
}
