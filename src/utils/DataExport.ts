import { PhysicsObject, ForceVector, Vector2D } from '../types/physics';

export interface SimulationData {
  timestamp: number;
  object: PhysicsObject;
  forces: ForceVector[];
  timeElapsed: number;
  trajectoryPoints: Vector2D[];
}

export class DataExport {
  static exportToCSV(data: SimulationData[]): string {
    const headers = [
      'Timestamp',
      'Time Elapsed (s)',
      'Position X (m)',
      'Position Y (m)',
      'Velocity X (m/s)',
      'Velocity Y (m/s)',
      'Acceleration X (m/s²)',
      'Acceleration Y (m/s²)',
      'Mass (kg)',
      'Net Force X (N)',
      'Net Force Y (N)',
      'Net Force Magnitude (N)',
      'Speed (m/s)',
      'Kinetic Energy (J)',
      'Potential Energy (J)',
      'Total Energy (J)'
    ];

    const rows = data.map(point => {
      const netForce = point.forces.reduce((net, force) => ({
        x: net.x + force.vector.x,
        y: net.y + force.vector.y
      }), { x: 0, y: 0 });
      
      const speed = Math.sqrt(point.object.velocity.x ** 2 + point.object.velocity.y ** 2);
      const kineticEnergy = 0.5 * point.object.mass * speed ** 2;
      const potentialEnergy = point.object.mass * 9.81 * Math.max(0, point.object.position.y);
      const totalEnergy = kineticEnergy + potentialEnergy;

      return [
        point.timestamp,
        point.timeElapsed,
        point.object.position.x,
        point.object.position.y,
        point.object.velocity.x,
        point.object.velocity.y,
        point.object.acceleration.x,
        point.object.acceleration.y,
        point.object.mass,
        netForce.x,
        netForce.y,
        Math.sqrt(netForce.x ** 2 + netForce.y ** 2),
        speed,
        kineticEnergy,
        potentialEnergy,
        totalEnergy
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  static exportToJSON(data: SimulationData[]): string {
    return JSON.stringify(data, null, 2);
  }

  static exportTrajectoryToCSV(trajectoryPoints: Vector2D[]): string {
    const headers = ['X (m)', 'Y (m)', 'Time (s)'];
    const timeStep = 0.016; // 60fps
    
    const rows = trajectoryPoints.map((point, index) => [
      point.x,
      point.y,
      index * timeStep
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  static exportForcesToCSV(forces: ForceVector[]): string {
    const headers = ['Force Name', 'Magnitude (N)', 'Angle (degrees)', 'X Component (N)', 'Y Component (N)', 'Color'];
    
    const rows = forces.map(force => [
      force.name,
      force.magnitude,
      force.angle,
      force.vector.x,
      force.vector.y,
      force.color
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static exportSimulationData(
    data: SimulationData[], 
    format: 'csv' | 'json' = 'csv',
    filename?: string
  ): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `physics-simulation-${timestamp}`;
    
    let content: string;
    let fileExtension: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = this.exportToJSON(data);
        fileExtension = 'json';
        mimeType = 'application/json';
        break;
      case 'csv':
      default:
        content = this.exportToCSV(data);
        fileExtension = 'csv';
        mimeType = 'text/csv';
        break;
    }

    const finalFilename = filename ? `${filename}.${fileExtension}` : `${defaultFilename}.${fileExtension}`;
    this.downloadFile(content, finalFilename, mimeType);
  }

  static exportTrajectoryData(trajectoryPoints: Vector2D[], filename?: string): void {
    const content = this.exportTrajectoryToCSV(trajectoryPoints);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFilename = filename || `trajectory-${timestamp}.csv`;
    this.downloadFile(content, finalFilename);
  }

  static exportForceData(forces: ForceVector[], filename?: string): void {
    const content = this.exportForcesToCSV(forces);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFilename = filename || `forces-${timestamp}.csv`;
    this.downloadFile(content, finalFilename);
  }

  static generateReport(data: SimulationData[]): string {
    if (data.length === 0) return 'No data available for report.';

    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    
    const totalTime = lastPoint.timeElapsed - firstPoint.timeElapsed;
    const displacement = Math.sqrt(
      (lastPoint.object.position.x - firstPoint.object.position.x) ** 2 +
      (lastPoint.object.position.y - firstPoint.object.position.y) ** 2
    );
    
    const avgSpeed = displacement / totalTime;
    
    const initialKE = 0.5 * firstPoint.object.mass * 
      (firstPoint.object.velocity.x ** 2 + firstPoint.object.velocity.y ** 2);
    const finalKE = 0.5 * lastPoint.object.mass * 
      (lastPoint.object.velocity.x ** 2 + lastPoint.object.velocity.y ** 2);
    
    const energyChange = finalKE - initialKE;

    return `
Physics Simulation Report
========================

Simulation Parameters:
- Object Mass: ${firstPoint.object.mass.toFixed(2)} kg
- Simulation Duration: ${totalTime.toFixed(2)} seconds
- Data Points: ${data.length}

Motion Analysis:
- Total Displacement: ${displacement.toFixed(2)} m
- Average Speed: ${avgSpeed.toFixed(2)} m/s
- Initial Velocity: (${firstPoint.object.velocity.x.toFixed(2)}, ${firstPoint.object.velocity.y.toFixed(2)}) m/s
- Final Velocity: (${lastPoint.object.velocity.x.toFixed(2)}, ${lastPoint.object.velocity.y.toFixed(2)}) m/s

Energy Analysis:
- Initial Kinetic Energy: ${initialKE.toFixed(2)} J
- Final Kinetic Energy: ${finalKE.toFixed(2)} J
- Energy Change: ${energyChange.toFixed(2)} J

Generated: ${new Date().toLocaleString()}
    `.trim();
  }
}
