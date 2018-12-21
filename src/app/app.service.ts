import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AppService {
  private _localConfigUrl = '/assets/config/config.json';

  private _environment: HttpConfig = { BACKEND: '', FRONT_DISPOSITIF: '' };

  constructor(private httpClient: HttpClient) {
    // this.getApplicationConfig()
    //   .subscribe((config) => this._environment = config);

    this.testFunction();
  }

  testFunction(): Promise<any> {
    return this.getApplicationConfig()
      .toPromise()
      .then(config => {
        this._environment = config;
      });
  }

  get environment() {
    return this._environment;
  }

  /**
   * Gather environment configuration
   */
  getApplicationConfig(): Observable<HttpConfig> {
    return this.httpClient.get<HttpConfig>(this._localConfigUrl);
  }
}

export interface HttpConfig {
  BACKEND: string;
  FRONT_DISPOSITIF: string;
}
