import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { ComponentViewRightMode, DossierService } from '../../dossiers.service';
import { CkeditorConfigService } from '../ckeditor-config.service';

@Component({
  selector: "siga-bloc-note",
  templateUrl: "./bloc-note.component.html",
  styleUrls: ["./bloc-note.component.scss"],
  providers: [CkeditorConfigService]
})
export class BlocNoteComponent extends ComponentViewRightMode
  implements OnInit {

  /**
   * Value of content textarea
   */
  ckeditorContent: string;
  /**
   * Control of CkeEditor
   */
  control: FormControl = new FormControl(this.ckeditorContent);

  /**
   * unsubscribe Subject
   */
  private unsubscribe = new Subject<void>();

  /**
   * valueBlocNoteChange: to nofity parent if value changed
   */
  @Output() valueBlocNoteChange: EventEmitter<string> = new EventEmitter();

  /**
   *  Recupération du texte du bloc note du back
   */
  @Input("blocNoteValueExist") blocNoteValueExist: string;

  sigaCkeditorConfig: any;
  ckeditorContentInmemory: string;

  constructor(
    private dossierService: DossierService,
    private ckService: CkeditorConfigService
  ) {
    super(dossierService);
  }

  ngOnInit() {
    this.sigaCkeditorConfig = this.ckService.getConfig(150, 2000);
    this.ckeditorContent = this.blocNoteValueExist
      ? this.blocNoteValueExist
      : "";
    this.setControlListenner();
  }

  setControlListenner() {
    this.control.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(saisie => {
        this.blocNoteValueExist = saisie;
        this.valueBlocNoteChange.emit(this.blocNoteValueExist);
      });
  }
}
