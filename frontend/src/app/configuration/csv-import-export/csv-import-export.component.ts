import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ModeService } from '../../services/mode.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-csv-import-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './csv-import-export.component.html',
  styleUrl: './csv-import-export.component.scss'
})
export class CsvImportExportComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  isUploading = false;
  isDownloading = false;
  downloadingFormat: 'zip' | 'excel' | null = null;
  uploadMessage: string = '';
  uploadError: string = '';
  dragOver = false;
  showInfoModal = false;

  constructor(
    private http: HttpClient,
    private modeService: ModeService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Prevent scrolling on body and html only for this page
    document.body.classList.add('csv-page-no-scroll');
    document.documentElement.classList.add('csv-page-no-scroll');
    // Fix navbar for this page
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      (navbar as HTMLElement).classList.add('csv-page-fixed');
    }
  }

  ngOnDestroy(): void {
    // Re-enable scrolling when leaving the page
    document.body.classList.remove('csv-page-no-scroll');
    document.documentElement.classList.remove('csv-page-no-scroll');
    // Remove navbar fix
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      (navbar as HTMLElement).classList.remove('csv-page-fixed');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0], input);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isAdminMode() && !this.isUploading) {
      this.dragOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    if (!this.isAdminMode() || this.isUploading) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File, input?: HTMLInputElement): void {
    const extension = file.name.toLowerCase().split('.').pop();

    // Allow ZIP archives and Excel files (.xlsx)
    if (extension !== 'zip' && extension !== 'xlsx') {
      this.uploadError = 'Nur ZIP- oder Excel-Dateien werden unterstützt.';
      this.uploadMessage = '';
      this.selectedFile = null;
      if (input) {
        input.value = '';
      }
      return;
    }

    this.selectedFile = file;
    this.uploadError = '';
    this.uploadMessage = `Datei ausgewählt: ${file.name}`;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.uploadError = 'Bitte wählen Sie eine Datei aus.';
      return;
    }

    if (!this.modeService.isAdminMode()) {
      this.uploadError = 'Nur im Admin-Modus können Daten importiert werden.';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadMessage = '';

    const formData = new FormData();
    formData.append('dataPackage', this.selectedFile);

    let headers = new HttpHeaders();
    if (this.modeService.isAdminMode()) {
      headers = headers.set('KEY', environment.apiKey);
    }

    this.http.post(`${environment.apiUrl}data-package/upload`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          this.isUploading = false;
          this.uploadMessage = response.message || 'Datenpaket wurde erfolgreich importiert.';
          this.uploadError = '';
          this.selectedFile = null;
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          this.alertService.success(this.uploadMessage);
        },
        error: (error) => {
          this.isUploading = false;
          const errorMessage = error.error?.message || error.error || 'Import fehlgeschlagen. Bitte versuchen Sie es erneut.';
          this.uploadError = errorMessage;
          this.uploadMessage = '';
          this.alertService.error(errorMessage);
        }
      });
  }

  downloadFile(format: 'zip' | 'excel' = 'zip'): void {
    this.isDownloading = true;
    this.downloadingFormat = format;
    this.uploadError = '';
    this.uploadMessage = '';

    this.http.get(`${environment.apiUrl}data-package/download?format=${format}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        this.downloadingFormat = null;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const extension = format === 'excel' ? 'xlsx' : 'zip';
        link.download = `trench-data-${timestamp}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        const formatName = format === 'excel' ? 'Excel-Datei' : 'ZIP-Datei';
        this.uploadMessage = `${formatName} wurde erfolgreich heruntergeladen.`;
        this.alertService.success(`${formatName} wurde erfolgreich heruntergeladen.`);
      },
      error: (error) => {
        this.isDownloading = false;
        this.downloadingFormat = null;
        const errorMessage = error.error?.message || 'Export fehlgeschlagen. Bitte versuchen Sie es erneut.';
        this.uploadError = errorMessage;
        this.uploadMessage = '';
        this.alertService.error(errorMessage);
      }
    });
  }

  isAdminMode(): boolean {
    return this.modeService.isAdminMode();
  }

  openInfoModal(): void {
    this.showInfoModal = true;
  }

  closeInfoModal(): void {
    this.showInfoModal = false;
  }
}

