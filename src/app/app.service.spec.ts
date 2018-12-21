// 'http://integration.siga.akka.eu:9090/siga'

export class AppServiceStub {
  private _environment = {
    BACKEND: 'mockUrl',
  };

  constructor(
  ) { }

  get environment() {
    return this._environment;
  }

  /**
   * Gather environment configuration
   */
  setApplicationConfig() {

  }
}
