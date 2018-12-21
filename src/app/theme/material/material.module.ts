import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material';
import { MatSortModule, MatTableModule, MatTooltipModule } from '@angular/material/';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,
        MatSnackBarModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatPaginatorModule,
        MatTabsModule,
        MatExpansionModule,
        MatTooltipModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatTableModule,
        MatSortModule,
        MatBadgeModule
    ],
    exports: [
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,
        MatSnackBarModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatPaginatorModule,
        MatTabsModule,
        MatExpansionModule,
        MatTooltipModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatTableModule,
        MatSortModule,

    ]
})
export class MaterialModule { }
