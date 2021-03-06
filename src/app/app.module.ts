import { CUSTOM_ELEMENTS_SCHEMA, DEFAULT_CURRENCY_CODE, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import {CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import { AppComponent } from './app.component';
import { HeaderComponent } from './menu/header/header.component';
import { TicketCreateComponent } from './tickets/ticket-create/ticket-create.component';
import { TicketListComponent } from './tickets/ticket-list/ticket-list.component';
import { TicketEditComponent } from './tickets/ticket-edit/ticket-edit.component';
import { CategoryComponent } from './categories/category/category.component';

import { AuthInterceptor } from './auth/auth-interceptor';
import { ErrorInterceptor } from './error-interceptor';
import { ErrorComponent } from './error/error/error.component';
import { AngularMaterialModule } from './angular-material.module';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@angular/router';
import { InformationComponent } from './infomations/information/information.component';
import { CreateInfoComponent } from './infomations/create-info/create-info.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { QRCodeModule } from 'angularx-qrcode';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { TicketsCreateFromImageComponent } from './tickets/tickets-create-from-image/tickets-create-from-image.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TicketsCreateFromExcelComponent } from './tickets/tickets-create-from-excel/tickets-create-from-excel.component';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import * as  Cloudinary from 'cloudinary-core';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import {
  AngularFireStorageModule,
  AngularFireStorageReference,
  AngularFireUploadTask,
  // StorageBucket
} from '@angular/fire/storage';
import { ChartsModule } from 'ng2-charts';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TicketCreateComponent,
    TicketListComponent,
    TicketEditComponent,
    CategoryComponent,
    ErrorComponent,
    InformationComponent,
    CreateInfoComponent,
    OrderListComponent,
    OrderDetailComponent,
    DashboardComponent,
    TicketsComponent,
    OrdersComponent,
    TicketsCreateFromImageComponent,
    TicketsCreateFromExcelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NgxMatSelectSearchModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    AuthModule,
    NgxMaterialTimepickerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ImageCropperModule,
    QRCodeModule,
    AngularFireStorageModule,
    [SweetAlert2Module.forRoot()],
    AngularFireModule.initializeApp(environment.firebaseConfig, 'cloud'),
    ChartsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  providers: [
    {provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    MatDatepickerModule
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule {}
