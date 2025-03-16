import { Injectable } from '@angular/core';
import { BackendService } from '../../backend.service';
import { MeasurementProbe } from './measurement-probes';

@Injectable({
  providedIn: 'root',
})
export class MeasurementProbeService {
  public measurementProbes: MeasurementProbe[] = [];

  constructor(private backendService: BackendService) { }

  ngOnInit(){
    this.loadAllMeasurementProbes();
    console.log(this.measurementProbes);
  }

  public async loadAllMeasurementProbes(){
    this.measurementProbes = await this.backendService.getAllMeasurementProbes();
    console.log("Loaded all measurement probes",  this.measurementProbes);
  }

  public async addMeasurementProbe(probe: MeasurementProbe){
    this.measurementProbes.push(await this.backendService.addMeasurementProbe(probe));
    this.loadAllMeasurementProbes();
  }

  public async updateMeasurementProbe(probe: MeasurementProbe){
    await this.backendService.updateMeasurementProbe(probe);
    this.loadAllMeasurementProbes();
  }

  public async deleteMeasurementProbe(probe: MeasurementProbe){
    await this.backendService.deleteMeasurementProbe(probe);
    this.loadAllMeasurementProbes();
  }
}
