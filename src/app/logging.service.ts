import { Injectable } from '@angular/core';

/**
 * This class is just for demo purposes, it just to see how services in modules work depending of its declaration
 */
@Injectable({ providedIn: 'root'})
export class LoggingService {
  private lastLog: string;

  printLog(message: string) {
    console.log(message);
    console.log(this.lastLog);
    this.lastLog = message;
  }
}
